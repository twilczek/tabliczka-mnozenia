import { useState, useEffect } from 'react';
import { useAppContext, RangeType } from '../contexts/AppContext';
import { calculateMaxQuestions } from '../utils/mathUtils';

interface SettingsProps {
  mode: 'multiplication' | 'division';
  onBack?: () => void;
}

export default function Settings({ mode, onBack }: SettingsProps) {
  const { 
    setMode, 
    setNumberRange, 
    setQuestionCount,
    divisionRangeType,
    setDivisionRangeType,
    setCurrentScore,
    selectedNumbers,
    setSelectedNumbers,
    questionCount,
    timerDuration,
    setTimerDuration
  } = useAppContext();

  const [localQuestionCount, setLocalQuestionCount] = useState(questionCount);
  const [localDivisionRange, setLocalDivisionRange] = useState<RangeType>(divisionRangeType);
  const [localTimerDuration, setLocalTimerDuration] = useState(timerDuration);
  const [maxPossibleQuestions, setMaxPossibleQuestions] = useState(50);
  
  // Przygotuj wybrane liczby na podstawie trybu
  useEffect(() => {
    if (mode === 'multiplication') {
      // Dla mnożenia, czyścimy wybrane liczby, aby użytkownik wybrał je sam
      setSelectedNumbers([]);
    } else {
      // Dla dzielenia, automatycznie wybieramy liczby 2-9 jako dzielniki
      // co pozwoli generować problemy z całkowitą odpowiedzią
      setSelectedNumbers([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
  }, [mode, setSelectedNumbers]);
  
  // Handle number selection toggle
  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      // Allow deselecting any number
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  // Calculate max possible questions based on selected numbers
  useEffect(() => {
    // For multiplication mode, calculate based on selected numbers
    if (mode === 'multiplication') {
      const maxQuestions = calculateMaxQuestions(selectedNumbers);
      setMaxPossibleQuestions(maxQuestions);
      if (selectedNumbers.length === 0) {
        // When no numbers are selected, ensure question count remains 0
        setLocalQuestionCount(0);
      } else if (localQuestionCount === 0) {
        // When the first number is selected, default to 10 questions
        setLocalQuestionCount(10);
      } else if (localQuestionCount > maxQuestions) {
        // If current question count exceeds maximum possible, adjust it
        setLocalQuestionCount(maxQuestions);
      }
    }
  }, [mode, selectedNumbers, localQuestionCount]);
  
  // Handle question count adjustment
  const adjustQuestionCount = (change: number) => {
    const newValue = localQuestionCount + change;
    // Enforce min of 5 and max of maxPossibleQuestions
    if (newValue >= 5 && newValue <= maxPossibleQuestions) {
      setLocalQuestionCount(newValue);
    }
  };

  // Function to handle incrementing/decrementing timer duration
  const adjustTimerDuration = (amount: number) => {
    const newValue = localTimerDuration + amount;
    // Enforce min of 3 and max of 30
    if (newValue >= 3 && newValue <= 30) {
      setLocalTimerDuration(newValue);
    }
  };

  const handleStartQuiz = () => {
    // Don't allow starting if no numbers are selected
    if (mode === 'multiplication' && selectedNumbers.length === 0) {
      return;
    }
    
    setCurrentScore(0);
    // For division, always set question count to 10
    setQuestionCount(mode === 'division' ? 10 : localQuestionCount);
    setTimerDuration(localTimerDuration);
    
    if (mode === 'multiplication') {
      // Use selected numbers as the range, but also set min/max for compatibility
      setNumberRange([Math.min(...selectedNumbers) || 2, Math.max(...selectedNumbers) || 9]);
    } else {
      setDivisionRangeType(localDivisionRange);
      // Set appropriate number ranges based on division range type
      if (localDivisionRange === 'low') {
        setNumberRange([2, 30]);
      } else if (localDivisionRange === 'medium') {
        setNumberRange([31, 60]);
      } else { // high
        setNumberRange([61, 100]);
      }
    }
    
    // Move to the question screen
    setMode(mode);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] text-white">
      <h1 className="text-3xl font-bold text-center py-2 text-blue-500">
        {mode === 'multiplication' ? 'Ustawienia mnożenia' : 'Ustawienia dzielenia'}
      </h1>
      
      <div className="flex-1 flex flex-col space-y-4 px-4 pb-4 overflow-y-auto">
        {mode === 'multiplication' ? (
          <div className="space-y-3">
            <label className="block text-xl font-semibold text-gray-300">
              Wybierz liczby do ćwiczenia:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
                <button
                  key={number}
                  onClick={() => toggleNumber(number)}
                  className={`
                    h-16 rounded-xl text-2xl font-bold flex items-center justify-center
                    ${selectedNumbers.includes(number) 
                      ? 'bg-blue-600 hover:bg-blue-500' 
                      : 'bg-[#1e293b] hover:bg-[#334155]'}
                    transition-colors
                  `}
                >
                  {number}
                </button>
              ))}
            </div>
            {selectedNumbers.length > 0 && (
              <p className="text-gray-300">
                {`Wybrano ${selectedNumbers.length} ${selectedNumbers.length === 1 ? 'liczbę' : selectedNumbers.length < 5 ? 'liczby' : 'liczb'}`}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xl font-semibold text-gray-300">
              Poziom trudności:
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setLocalDivisionRange('low')}
                className={`
                  h-24 rounded-xl text-lg font-bold flex flex-col items-center justify-center
                  ${localDivisionRange === 'low' 
                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                    : 'bg-[#1e293b] hover:bg-[#334155] text-white'}
                  transition-colors
                `}
              >
                <span>Łatwy</span>
                <span className="text-sm">(2-30)</span>
              </button>
              <button
                onClick={() => setLocalDivisionRange('medium')}
                className={`
                  h-24 rounded-xl text-lg font-bold flex flex-col items-center justify-center
                  ${localDivisionRange === 'medium' 
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-black' 
                    : 'bg-[#1e293b] hover:bg-[#334155] text-white'}
                  transition-colors
                `}
              >
                <span>Średni</span>
                <span className="text-sm">(31-60)</span>
              </button>
              <button
                onClick={() => setLocalDivisionRange('high')}
                className={`
                  h-24 rounded-xl text-lg font-bold flex flex-col items-center justify-center
                  ${localDivisionRange === 'high' 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-[#1e293b] hover:bg-[#334155] text-white'}
                  transition-colors
                `}
              >
                <span>Trudny</span>
                <span className="text-sm">(61-100)</span>
              </button>
            </div>
            <p className="text-gray-300 text-sm mt-2">
              Wszystkie dzielenia będą miały wynik w zakresie 1-10 (dzielniki 2-10)
            </p>
          </div>
        )}

        {/* Questions count selector - only show for multiplication mode */}
        {mode === 'multiplication' && (
        <div>
          <label className="block text-xl font-semibold text-gray-300 mb-1">
            Liczba pytań: <span className="text-sm font-normal">(max: {maxPossibleQuestions})</span>
          </label>
          <div className="flex items-center h-16 bg-[#1e293b] rounded-xl">
            <button 
              onClick={() => adjustQuestionCount(-5)}
              className="h-full w-16 bg-[#334155] text-2xl font-bold rounded-l-xl flex items-center justify-center"
            >
              -5
            </button>
            <button 
              onClick={() => adjustQuestionCount(-1)}
              className="h-full w-16 bg-[#334155] text-2xl font-bold flex items-center justify-center"
            >
              -1
            </button>
            <div className="flex-1 flex items-center justify-center text-3xl font-bold">
              {localQuestionCount}
            </div>
            <button 
              onClick={() => adjustQuestionCount(1)}
              className="h-full w-16 bg-[#334155] text-2xl font-bold flex items-center justify-center"
              disabled={localQuestionCount >= maxPossibleQuestions}
            >
              +1
            </button>
            <button 
              onClick={() => adjustQuestionCount(5)}
              className="h-full w-16 bg-[#334155] text-2xl font-bold rounded-r-xl flex items-center justify-center"
              disabled={localQuestionCount + 5 > maxPossibleQuestions}
            >
              +5
            </button>
          </div>
          {selectedNumbers.length > 0 && (
            <p className="mt-2 text-sm text-gray-400 text-center">
              Dostępne zadania: {maxPossibleQuestions}
            </p>
          )}
        </div>
        )}

        {/* Timer duration selector */}
        <div>
          <label className="block text-xl font-semibold text-gray-300 mb-1">
            Czas na odpowiedź:
          </label>
          <div className="flex items-center h-16 bg-[#1e293b] rounded-xl">
            <button 
              onClick={() => adjustTimerDuration(-5)}
              className="h-full w-16 bg-[#334155] text-2xl font-bold rounded-l-xl flex items-center justify-center"
            >
              -5
            </button>
            <button 
              onClick={() => adjustTimerDuration(-1)}
              className="h-full w-16 bg-[#334155] text-2xl font-bold flex items-center justify-center"
            >
              -1
            </button>
            <div className="flex-1 flex items-center justify-center text-3xl font-bold">
              {localTimerDuration}s
            </div>
            <button 
              onClick={() => adjustTimerDuration(1)}
              className="h-full w-16 bg-[#334155] text-2xl font-bold flex items-center justify-center"
            >
              +1
            </button>
            <button 
              onClick={() => adjustTimerDuration(5)}
              className="h-full w-16 bg-[#334155] text-2xl font-bold rounded-r-xl flex items-center justify-center"
            >
              +5
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <button
            onClick={onBack || (() => setMode('home'))}
            className="col-span-1 bg-[#334155] hover:bg-[#475569] text-white font-bold py-4 rounded-xl text-lg transition-colors flex items-center justify-center"
          >
            Wróć
          </button>
          <button
            onClick={handleStartQuiz}
            disabled={mode === 'multiplication' && selectedNumbers.length === 0}
            className={`col-span-3 font-bold py-4 rounded-xl text-xl transition-colors ${
              mode === 'multiplication' && selectedNumbers.length === 0
                ? 'bg-gray-700 opacity-70 cursor-not-allowed'
                : mode === 'multiplication'
                  ? 'bg-blue-600 hover:bg-blue-500'
                  : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            Rozpocznij
          </button>
        </div>
      </div>
    </div>
  );
} 