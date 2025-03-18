import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Types
export type AppMode = 'home' | 'multiplication' | 'division' | 'review' | 'results';
export type RangeType = 'low' | 'medium' | 'high'; // Dla dzielenia: low = 2-30, medium = 20-60, high = 50-100

export interface MistakeRecord {
  question: string;
  correctAnswer: number;
  userAnswer: number;
  mode: 'multiplication' | 'division';
}

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  numberRange: [number, number];
  setNumberRange: (range: [number, number]) => void;
  selectedNumbers: number[];
  setSelectedNumbers: (numbers: number[]) => void;
  divisionRangeType: RangeType;
  setDivisionRangeType: (type: RangeType) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  currentScore: number;
  setCurrentScore: (score: number) => void;
  mistakes: MistakeRecord[];
  addMistake: (mistake: MistakeRecord) => void;
  resetMistakes: () => void;
  removeMistake: (index: number) => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
  resetContext: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeInternal] = useState<AppMode>('home');
  const [numberRange, setNumberRange] = useState<[number, number]>([1, 10]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [divisionRangeType, setDivisionRangeType] = useState<RangeType>('low');
  const [questionCount, setQuestionCount] = useState(10);
  const [currentScore, setCurrentScore] = useState(0);
  const [timerDuration, setTimerDuration] = useState(10); // Default timer: 10 seconds
  
  // Get stored mistakes from localStorage or initialize empty array
  const storedMistakes = localStorage.getItem('mistakes');
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(
    storedMistakes ? JSON.parse(storedMistakes) : []
  );
  
  // Reset function to clear scores and return to defaults
  const resetContext = useCallback(() => {
    setCurrentScore(0);
    setQuestionCount(10);
  }, []);
  
  // Custom setMode function that resets context when going to home
  const setMode = useCallback((newMode: AppMode) => {
    if (newMode === 'home') {
      resetContext();
    }
    
    // W trybie powtórki nie potrzebujemy już synchronizować mistakes z localStorage
    // To jest teraz obsługiwane w komponencie Review
    
    setModeInternal(newMode);
  }, [resetContext]);

  // Add a mistake and update localStorage
  const addMistake = (mistake: MistakeRecord) => {
    const updatedMistakes = [...mistakes, mistake];
    setMistakes(updatedMistakes);
    localStorage.setItem('mistakes', JSON.stringify(updatedMistakes));
  };

  // Reset all mistakes
  const resetMistakes = () => {
    setMistakes([]);
    localStorage.setItem('mistakes', JSON.stringify([]));
  };

  // Remove a specific mistake (after correct answer in review mode)
  const removeMistake = (index: number) => {
    const updatedMistakes = [...mistakes];
    updatedMistakes.splice(index, 1);
    setMistakes(updatedMistakes);
    localStorage.setItem('mistakes', JSON.stringify(updatedMistakes));
  };

  const value = {
    mode,
    setMode,
    numberRange,
    setNumberRange,
    selectedNumbers,
    setSelectedNumbers,
    divisionRangeType,
    setDivisionRangeType,
    questionCount, 
    setQuestionCount,
    currentScore,
    setCurrentScore,
    mistakes,
    addMistake,
    resetMistakes,
    removeMistake,
    timerDuration,
    setTimerDuration,
    resetContext
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 