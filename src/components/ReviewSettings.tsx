import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface ReviewSettingsProps {
  onBack?: () => void;
}

export default function ReviewSettings({ onBack }: ReviewSettingsProps) {
  const { 
    setMode, 
    timerDuration,
    setTimerDuration,
    mistakes
  } = useAppContext();

  const [localTimerDuration, setLocalTimerDuration] = useState(timerDuration);
  
  // Handle timer duration adjustments
  const adjustTimerDuration = (change: number) => {
    const newValue = localTimerDuration + change;
    // Ensure the timer duration stays within reasonable limits (5-30 seconds)
    if (newValue >= 5 && newValue <= 30) {
      setLocalTimerDuration(newValue);
    }
  };

  const handleStartReview = () => {
    // Update timer duration in context
    setTimerDuration(localTimerDuration);
    console.log('Timer duration set to:', localTimerDuration, 'seconds');
    
    // Move to the review screen
    setMode('review');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] text-white">
      <h1 className="text-3xl font-bold text-center py-4 text-purple-500">
        Ustawienia powtórki
      </h1>
      
      <div className="flex-1 flex flex-col space-y-6 px-4 pb-4 overflow-y-auto">
        {/* Info message */}
        <div className="bg-[#1e293b] rounded-xl p-4 mt-4">
          <p className="text-gray-300 text-center">
            Przygotuj się do powtórki {mistakes.length} zadań, które wymagają dodatkowej praktyki.
          </p>
        </div>

        {/* Timer duration selector */}
        <div>
          <label className="block text-xl font-semibold text-gray-300 mb-2">
            Czas na odpowiedź (sekundy):
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
            onClick={handleStartReview}
            className="col-span-3 bg-purple-600 hover:bg-purple-500 font-bold py-4 rounded-xl text-xl transition-colors"
          >
            Rozpocznij
          </button>
        </div>
      </div>
    </div>
  );
} 