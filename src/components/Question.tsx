import { useState, useEffect, useRef } from 'react';
import { useAppContext, MistakeRecord } from '../contexts/AppContext';
import { formatProblem } from '../utils/mathUtils';
import { getQuizMultiplicationProblems, getQuizDivisionProblems } from '../utils/allProblems';
import useTimer from '../hooks/useTimer';
import { HomeIcon } from './icons/HomeIcon';
import { COUNTDOWN_START_DELAY } from '../utils/constants';

// Add array of possible positive feedback messages with emojis
const POSITIVE_FEEDBACK = [
  "Super! 🎉",
  "Brawo! 👏",
  "Świetnie! 🌟",
  "Dobrze! 👍",
  "Ekstra! 🏆",
  "Znakomicie! 🚀",
  "Doskonale! 💯",
  "Fantastycznie! 🤩"
];

// Get random positive feedback message
function getRandomPositiveFeedback() {
  const randomIndex = Math.floor(Math.random() * POSITIVE_FEEDBACK.length);
  return POSITIVE_FEEDBACK[randomIndex];
}

interface QuestionProps {
  isReviewMode?: boolean;
  reviewItem?: MistakeRecord;
  reviewIndex?: number;
  onAnswered?: (correct: boolean, index?: number) => void;
}

export default function Question({ isReviewMode = false, reviewItem, reviewIndex, onAnswered }: QuestionProps) {
  const { 
    mode, 
    numberRange,
    selectedNumbers,
    addMistake, 
    currentScore,
    setCurrentScore,
    setMode,
    questionCount,
    mistakes,
    timerDuration,
    correctFeedbackDelay,
    incorrectFeedbackDelay
  } = useAppContext();
  
  // Dodaj referencję do śledzenia, czy komponent jest aktywny
  const isMounted = useRef(true);
  
  const [currentProblem, setCurrentProblem] = useState<[number, number, number] | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  // Track current question number
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  // Store all generated problems for the current session
  const [allProblems, setAllProblems] = useState<Array<[number, number, number]>>([]);
  // Add a flag to prevent multiple rapid transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Timer setup using timerDuration from context
  const TOTAL_TIME = timerDuration;
  
  // Log for debugging
  useEffect(() => {
    console.log('Question component - timer duration:', timerDuration, 'seconds, isReviewMode:', isReviewMode);
    console.log('Feedback delays - correct:', correctFeedbackDelay, 'ms, incorrect:', incorrectFeedbackDelay, 'ms');
  }, [timerDuration, isReviewMode, correctFeedbackDelay, incorrectFeedbackDelay]);

  const { time, startTimer, stopTimer, resetTimer } = useTimer(TOTAL_TIME, () => {
    handleSubmit(true);
  });

  // Calculate timer progress percentage
  const timerProgressPercentage = (time / TOTAL_TIME) * 100;
  
  // Monitoruj kiedy timer jest w trakcie odliczania (active countdown)
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  // Uruchom odliczanie
  const startCountdown = () => {
    setIsCountingDown(true);
    startTimer();
  };
  
  // Zatrzymaj odliczanie
  const stopCountdown = () => {
    setIsCountingDown(false);
    stopTimer();
  };

  // Generate all problems for the session at the beginning
  useEffect(() => {
    if (isReviewMode) {
      // W trybie powtórek, inicjujemy pytanie bezpośrednio z reviewItem
      if (reviewItem) {
        const [a, b] = reviewItem.question.split(' ').filter(part => !isNaN(Number(part))).map(Number);
        let result: number;
        
        if (reviewItem.mode === 'multiplication') {
          result = a * b;
        } else {
          result = a / b;
        }
        
        setCurrentProblem([a, b, result]);
        
        // Reset state
        setAnswer('');
        setFeedback(null);
        setIsTransitioning(false);
        resetTimer();
        
        // Krótkie opóźnienie przed rozpoczęciem odliczania, aby zapewnić reset bez animacji
        setTimeout(() => {
          startCountdown();
        }, COUNTDOWN_START_DELAY);
      }
      return;
    }

    // Generate quiz problems using pre-generated lists
    let problems: Array<[number, number, number]> = [];
    if (mode === 'multiplication') {
      problems = getQuizMultiplicationProblems(selectedNumbers, questionCount);
    } else {
      problems = getQuizDivisionProblems(selectedNumbers, numberRange, questionCount);
    }

    setAllProblems(problems);
    
    // Add more detailed console log to show both requested and actual number of problems
    console.log(`Quiz requested ${questionCount} questions but generated ${problems.length} problems.`);
    console.log('Selected numbers:', selectedNumbers);
    console.log('Mode:', mode);
    if (mode === 'division') {
      console.log('Number range:', numberRange);
    }
    console.log('All generated problems for current quiz:', problems.map(([a, b, result]) => {
      const operator = mode === 'multiplication' ? '*' : '/';
      return `${a} ${operator} ${b} = ${result}`;
    }));

    if (problems.length > 0) {
      setCurrentProblem(problems[0]);
    }
    
    // Reset state
    setAnswer('');
    setFeedback(null);
    resetTimer();
    
    // Krótkie opóźnienie przed rozpoczęciem odliczania, aby zapewnić reset bez animacji
    setTimeout(() => {
      startCountdown();
    }, COUNTDOWN_START_DELAY);
    
  }, [isReviewMode, reviewItem, mode, numberRange, selectedNumbers, questionCount, resetTimer]);

  // Dodaj efekt, który będzie czyścił referencję przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle key press for numeric input
  const handleNumberInput = (digit: string) => {
    if (feedback) return; // Don't allow input when feedback is shown
    setAnswer(prev => {
      // Limit to 3 digits for reasonable answers
      if (prev.length >= 3) return prev;
      return prev + digit;
    });
  };

  // Handle backspace
  const handleBackspace = () => {
    if (feedback) return; // Don't allow input when feedback is shown
    setAnswer(prev => prev.slice(0, -1));
  };

  // Handle submission
  const handleSubmit = (isTimeUp: boolean = false) => {
    // Jeśli nie ma problemu lub brak odpowiedzi (i nie upłynął czas) lub jest w trakcie przejścia, przerwij
    if (!currentProblem || (!answer && !isTimeUp) || isTransitioning) return;
    
    // Set transitioning flag to prevent multiple submissions
    setIsTransitioning(true);
    stopCountdown();
    
    const userAnswer = Number(answer);
    const [a, b, correctAnswer] = currentProblem;
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
      setFeedback({ 
        correct: true, 
        message: getRandomPositiveFeedback()
      });
      
      if (!isReviewMode) {
        // Increment score by 1
        setCurrentScore(currentScore + 1);
      }
      // W trybie powtórki nie modyfikujemy listy błędów - to jest obsługiwane w komponencie Review
    } else {
      const operator = isReviewMode 
        ? reviewItem?.mode === 'multiplication' ? '*' : '/' 
        : mode === 'multiplication' ? '*' : '/';
      
      // Format the full problem with correct answer
      const fullProblem = `${a} ${operator} ${b} = ${correctAnswer}`;
      
      setFeedback({
        correct: false,
        message: fullProblem
      });
      
      // Dodawanie do powtórek tylko gdy NIE jesteśmy w trybie powtórki
      // I tylko gdy czas się skończył LUB użytkownik odpowiedział źle
      if (!isReviewMode && (isTimeUp || (!isTimeUp && userAnswer !== 0))) {
        // Store the mistake for review
        addMistake({
          question: formatProblem(a, b, operator as '*' | '/'),
          correctAnswer,
          userAnswer: isTimeUp ? 0 : userAnswer, // Gdy czas minął, zapisz 0 jako odpowiedź
          mode: mode as 'multiplication' | 'division'
        });
      }
    }
    
    // Call the callback if provided (for review mode), but only after the feedback delay
    if (onAnswered) {
      setTimeout(() => {
        // Pass the correct status to the Review component
        onAnswered(isCorrect, reviewIndex);
        // Reset transitioning flag after the callback
        setIsTransitioning(false);
      }, isCorrect ? correctFeedbackDelay : incorrectFeedbackDelay);
    } else {
      // We're not automatically moving to the next question anymore
      // Just reset the transitioning flag to allow user interaction
      setIsTransitioning(false);
    }
  };

  // Format the current problem
  const getProblemText = () => {
    if (!currentProblem) return '';
    
    const [a, b] = currentProblem;
    const operator = isReviewMode 
      ? reviewItem?.mode === 'multiplication' ? '×' : '÷' 
      : mode === 'multiplication' ? '×' : '÷';
    
    return `${a} ${operator} ${b} = ?`;
  };

  // Dodaj funkcję bezpiecznego powrotu do strony głównej
  const handleReturnHome = () => {
    // Oznacz, że komponent nie jest już aktywny
    isMounted.current = false;
    
    // Zatrzymaj timer, aby nie dodał błędu po przejściu do Home
    stopCountdown();
    stopTimer();
    
    // Wyczyść wszystkie oczekujące procesy
    setIsTransitioning(true);
    
    // Przejdź do strony głównej
    setMode('home');
  };

  // Add a function to handle moving to the next question
  const handleNextQuestion = () => {
    // Only proceed if there's feedback showing
    if (!feedback) return;
    
    // If we're in review mode, nothing to do here as Review component handles navigation
    if (isReviewMode) return;
    
    // Increment question number if not at the last question
    if (currentQuestionNumber < questionCount) {
      const nextQuestionNumber = currentQuestionNumber + 1;
      setCurrentQuestionNumber(nextQuestionNumber);
      
      // Set the next problem
      if (nextQuestionNumber <= allProblems.length) {
        setCurrentProblem(allProblems[nextQuestionNumber - 1]);
      }
    } else {
      // If we reached the last question, go to results screen
      setMode('results');
      return;
    }
    
    // Reset for next question
    setAnswer('');
    setFeedback(null);
    resetTimer();
    
    // Start timer for next question
    setTimeout(() => {
      startCountdown();
    }, COUNTDOWN_START_DELAY);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] text-white">
      {/* Top bar with counter and back button */}
      <div className="w-full flex justify-between items-center px-4 py-4">
        <div className="text-white text-2xl font-bold">
          {isReviewMode ? `${reviewIndex !== undefined ? reviewIndex + 1 : 1}/${mistakes.length}` : `${currentQuestionNumber}/${questionCount}`}
        </div>
        
        <button
          onClick={handleReturnHome}
          className="rounded-full w-16 h-16 flex items-center justify-center bg-[#334155] hover:bg-[#475569]"
        >
          <HomeIcon />
        </button>
      </div>
      
      {/* Timer progress bar */}
      <div className="w-full h-2 bg-[#1e293b]">
        <div 
          className={`h-full ${
            time > 5 ? 'bg-green-500' : time > 2 ? 'bg-yellow-500' : 'bg-red-500'
          } ${isCountingDown ? 'transition-[width] duration-1000 ease-linear' : ''}`}
          style={{ width: `${timerProgressPercentage}%` }}
        ></div>
      </div>
      
      {/* Problem display */}
      <div className="text-6xl text-center font-bold my-8">
        {getProblemText()}
      </div>

      {/* Answer display */}
      <div className="mx-4 h-20 bg-[#1e293b] rounded-lg mb-4 flex items-center justify-end px-6">
        <span className="text-4xl font-bold">
          {answer || ''}
        </span>
      </div>

      {/* Main content area - keypad and submit button */}
      <div className="flex-1 flex flex-col mx-4 mb-6">
        {/* Keypad in 3x4 grid */}
        <div className="grid grid-cols-3 gap-3 h-full">
          {/* First row: 1, 2, 3 */}
          <button 
            onClick={() => handleNumberInput('1')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            1
          </button>
          <button 
            onClick={() => handleNumberInput('2')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            2
          </button>
          <button 
            onClick={() => handleNumberInput('3')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            3
          </button>
          
          {/* Second row: 4, 5, 6 */}
          <button 
            onClick={() => handleNumberInput('4')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            4
          </button>
          <button 
            onClick={() => handleNumberInput('5')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            5
          </button>
          <button 
            onClick={() => handleNumberInput('6')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            6
          </button>
          
          {/* Third row: 7, 8, 9 */}
          <button 
            onClick={() => handleNumberInput('7')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            7
          </button>
          <button 
            onClick={() => handleNumberInput('8')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            8
          </button>
          <button 
            onClick={() => handleNumberInput('9')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            9
          </button>
          
          {/* Fourth row: Backspace, 0, OK */}
          <button 
            onClick={handleBackspace}
            disabled={!!feedback || answer.length === 0}
            className="rounded-xl bg-[#334155] flex-1 text-3xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            ←
          </button>
          <button 
            onClick={() => handleNumberInput('0')}
            disabled={!!feedback}
            className="rounded-xl bg-[#1e293b] flex-1 text-4xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            0
          </button>
          <button 
            onClick={() => handleSubmit()}
            disabled={!answer || !!feedback}
            className="rounded-xl bg-[#3b82f6] flex-1 text-3xl font-bold disabled:opacity-50 flex items-center justify-center"
          >
            OK
          </button>
        </div>
      </div>

      {/* Feedback message - now clickable to proceed to next question */}
      {feedback && (
        <div 
          className="fixed inset-0 flex items-center justify-center cursor-pointer"
          onClick={handleNextQuestion}
        >
          <div 
            className={`w-full p-6 text-center font-extrabold shadow-2xl rounded-none ${
              feedback.correct 
                ? 'bg-green-900 text-green-200 text-4xl' 
                : 'bg-red-900 text-red-200 text-6xl'
            }`}
          >
            {feedback.message}
            <div className="mt-4 text-lg opacity-75">Kliknij aby kontynuować</div>
          </div>
        </div>
      )}
    </div>
  );
} 