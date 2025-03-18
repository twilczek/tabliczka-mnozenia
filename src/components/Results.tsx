import { useAppContext } from '../contexts/AppContext';
import { useState, useEffect } from 'react';

// Ikony dla ocen
const GradeIcons = {
  1: "😢", // bardzo słaba
  2: "😕", // słaba
  3: "😐", // dostateczna
  4: "🙂", // dobra
  5: "😀", // bardzo dobra
  6: "🤩"  // celująca
};

export default function Results() {
  const { setMode, currentScore, questionCount, mode, resetContext } = useAppContext();
  const [grade, setGrade] = useState<1 | 2 | 3 | 4 | 5 | 6>(3);
  const [gradeDescription, setGradeDescription] = useState("");
  const isReviewMode = mode === 'review';
  
  // Oblicz procent poprawnych odpowiedzi i ocenę
  useEffect(() => {
    // Zabezpieczenie przed dzieleniem przez zero
    if (questionCount === 0) return;
    
    const percentage = (currentScore / questionCount) * 100;
    
    // Określ ocenę na podstawie procentu poprawnych odpowiedzi
    let calculatedGrade: 1 | 2 | 3 | 4 | 5 | 6;
    let description = "";
    
    if (percentage < 30) {
      calculatedGrade = 1;
      description = "Niedostateczny";
    } else if (percentage < 50) {
      calculatedGrade = 2;
      description = "Dopuszczający";
    } else if (percentage < 70) {
      calculatedGrade = 3;
      description = "Dostateczny";
    } else if (percentage < 85) {
      calculatedGrade = 4;
      description = "Dobry";
    } else if (percentage < 95) {
      calculatedGrade = 5;
      description = "Bardzo dobry";
    } else {
      calculatedGrade = 6;
      description = "Celujący";
    }
    
    setGrade(calculatedGrade);
    setGradeDescription(description);
  }, [currentScore, questionCount]);
  
  // Funkcja obsługująca powrót do menu głównego
  const handleReturnToHome = () => {
    // Resetuj kontekst przed powrotem do menu głównego
    resetContext();
    setMode('home');
  };
  
  // Funkcja obsługująca powrót do trybu powtórki
  const handleReturnToReview = () => {
    // Resetuj kontekst przed ponownym rozpoczęciem powtórki
    resetContext();
    setMode('review');
  };
  
  // Funkcja obsługująca ponowną próbę (tryb mnożenia/dzielenia)
  const handleRetry = () => {
    window.location.reload();
  };
  
  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-500">
        {isReviewMode ? "Wyniki powtórki" : "Wyniki"}
      </h1>
      
      {/* Główny wynik i ocena */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="text-center">
          <div className="mb-4 text-5xl font-bold">
            {currentScore} / {questionCount}
          </div>
          <div className="text-xl text-gray-300">
            {questionCount > 0 ? Math.round((currentScore / questionCount) * 100) : 0}% poprawnych odpowiedzi
          </div>
        </div>
        
        {/* Ocena - tylko wyświetlana dla standardowych trybów (nie dla powtórki) */}
        {!isReviewMode && (
          <div className="bg-[#1e293b] rounded-xl w-full max-w-sm p-6 text-center">
            <div className="text-8xl mb-4">
              {GradeIcons[grade]}
            </div>
            <div className="text-3xl font-bold mb-2">
              Ocena: {grade}
            </div>
            <div className="text-xl text-gray-300">
              {gradeDescription}
            </div>
          </div>
        )}
        
        {/* Informacja dla trybu powtórki */}
        {isReviewMode && (
          <div className="bg-[#1e293b] rounded-xl w-full max-w-sm p-6 text-center">
            <div className="text-8xl mb-4">
              {currentScore === questionCount ? "🎯" : "🎮"}
            </div>
            <div className="text-xl text-gray-300 mt-2">
              {currentScore === questionCount 
                ? "Wszystkie pytania rozwiązane poprawnie!" 
                : "Niepoprawne odpowiedzi zostały zachowane do następnej powtórki."}
            </div>
          </div>
        )}
        
        {/* Komentarz motywacyjny */}
        <div className="text-center text-gray-300 text-lg">
          {isReviewMode 
            ? "Systematyczne powtórki to klucz do sukcesu!" 
            : grade >= 4 
              ? "Świetna robota! Tak trzymaj!" 
              : "Próbuj dalej, następnym razem będzie lepiej!"}
        </div>
      </div>
      
      {/* Przyciski */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          onClick={handleReturnToHome}
          className="bg-[#334155] hover:bg-[#475569] text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors"
        >
          Menu główne
        </button>
        <button
          onClick={isReviewMode ? handleReturnToReview : handleRetry}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors"
        >
          {isReviewMode ? "Dalsze powtórki" : "Spróbuj ponownie"}
        </button>
      </div>
    </div>
  );
} 