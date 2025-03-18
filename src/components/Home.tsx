import { useAppContext } from '../contexts/AppContext';
import Settings from './Settings';
import { useState, useEffect } from 'react';
import { TrashIcon } from './icons/TrashIcon';

export default function Home() {
  const { setMode, setSelectedNumbers, resetMistakes } = useAppContext();
  const [settingsMode, setSettingsMode] = useState<'multiplication' | 'division' | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [localMistakesCount, setLocalMistakesCount] = useState(0);
  
  // Sprawdź ilość błędów w localStorage
  useEffect(() => {
    const storedMistakes = localStorage.getItem('mistakes');
    if (storedMistakes) {
      try {
        const mistakesArray = JSON.parse(storedMistakes);
        setLocalMistakesCount(mistakesArray.length);
      } catch (error) {
        console.error('Error parsing mistakes from localStorage', error);
        setLocalMistakesCount(0);
      }
    } else {
      setLocalMistakesCount(0);
    }
  }, []);

  // If settings mode is set, show the Settings component
  if (settingsMode) {
    return <Settings mode={settingsMode} onBack={() => setSettingsMode(null)} />;
  }

  // Prepare for division mode
  const handleDivisionClick = () => {
    // For division, we clear any selected numbers from multiplication mode
    setSelectedNumbers([]);
    setSettingsMode('division');
  };
  
  // Obsługa przycisku powtórki
  const handleReviewClick = () => {
    // Przejdź do trybu powtórki
    setMode('review');
  };

  // Function to clear all localStorage data
  const handleClearData = () => {
    if (showConfirmReset) {
      // Clear all localStorage
      localStorage.clear();
      
      // Reset application state
      setSelectedNumbers([]);
      
      // Clear all mistakes at once
      resetMistakes();
      
      // Reset local count
      setLocalMistakesCount(0);
      
      // Hide confirmation dialog
      setShowConfirmReset(false);
      
      // Show feedback (optional)
      alert('Dane zostały wyczyszczone! Aplikacja zostanie uruchomiona ponownie.');
      
      // Force a page refresh to ensure all state is reset
      window.location.reload();
    } else {
      setShowConfirmReset(true);
    }
  };

  // Otherwise show the home screen
  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0f172a] text-white py-6 px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-2">Tabliczka Mnożenia</h1>
        <p className="text-gray-300 text-lg">Ćwicz mnożenie i dzielenie</p>
      </div>

      {/* Math symbols and illustrations */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-6 text-5xl font-bold text-white opacity-70">
          <span className="text-blue-500">×</span>
          <span className="text-green-500">÷</span>
          <span className="text-yellow-500">=</span>
          <span className="text-purple-500">+</span>
        </div>
      </div>

      {/* Menu buttons */}
      <div className="grid grid-cols-1 gap-5">
        <button 
          onClick={() => setSettingsMode('multiplication')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 px-6 rounded-xl text-xl transition-colors"
        >
          Mnożenie
        </button>
        <button 
          onClick={handleDivisionClick}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-5 px-6 rounded-xl text-xl transition-colors"
        >
          Dzielenie
        </button>
        <button 
          onClick={handleReviewClick}
          disabled={localMistakesCount === 0}
          className={`
            ${localMistakesCount > 0 
              ? 'bg-purple-600 hover:bg-purple-500' 
              : 'bg-gray-700 opacity-70 cursor-not-allowed'
            } text-white font-bold py-5 px-6 rounded-xl text-xl transition-colors`}
        >
          Powtórka {localMistakesCount > 0 && `(${localMistakesCount})`}
        </button>
      </div>

      {/* Math equations decoration */}
      <div className="mt-8 grid grid-cols-2 gap-4 text-center opacity-50">
        <div className="p-3 bg-[#1e293b] rounded-lg">
          <div className="text-lg font-medium text-blue-400">3 × 4 = 12</div>
        </div>
        <div className="p-3 bg-[#1e293b] rounded-lg">
          <div className="text-lg font-medium text-green-400">8 ÷ 2 = 4</div>
        </div>
        <div className="p-3 bg-[#1e293b] rounded-lg">
          <div className="text-lg font-medium text-yellow-400">5 × 5 = 25</div>
        </div>
        <div className="p-3 bg-[#1e293b] rounded-lg">
          <div className="text-lg font-medium text-purple-400">20 ÷ 4 = 5</div>
        </div>
      </div>
      
      {/* Clear data button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleClearData}
          className="flex items-center justify-center space-x-2 p-3 rounded-full bg-[#1e293b] hover:bg-[#334155] transition-colors"
          title="Wyczyść wszystkie dane"
        >
          <TrashIcon />
          {showConfirmReset && (
            <span className="text-red-400 font-medium">Potwierdź</span>
          )}
        </button>
      </div>
    </div>
  );
} 