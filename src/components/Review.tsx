import { useState, useEffect, useRef } from 'react';
import { useAppContext, MistakeRecord } from '../contexts/AppContext';
import Question from './Question';
import { FEEDBACK_DELAY } from '../utils/constants';

export default function Review() {
  const { setMode, setCurrentScore, setQuestionCount } = useAppContext();
  const [reviewItems, setReviewItems] = useState<MistakeRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Tablica do śledzenia, które pytania były odpowiedziane poprawnie
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const isProcessingAnswer = useRef(false);
  
  // Przy inicjalizacji: pobrać błędy z localStorage i przygotować powtórkę
  useEffect(() => {
    // Pobrać błędy z localStorage
    const storedMistakes = localStorage.getItem('mistakes');
    const mistakes = storedMistakes ? JSON.parse(storedMistakes) : [];
    
    if (mistakes.length > 0) {
      // Zapisać liczbę pytań do powtórzenia
      setReviewItems(mistakes);
      setTotalCount(mistakes.length);
      
      // Inicjalizacja tablicy z odpowiedziami (wszystkie na false)
      setCorrectAnswers(new Array(mistakes.length).fill(false));
      
      // WAŻNE: Teraz NIE czyścimy localStorage tutaj
      // Wyczyścimy je dopiero po zakończeniu powtórki
      
      setIsLoading(false); // Zakończono ładowanie
    } else {
      // Jeśli nie ma błędów do powtórzenia, wróć do menu głównego
      setMode('home');
    }
  }, [setMode]);
  
  // Obsługa odpowiedzi na pytanie
  const handleAnswered = (correct: boolean) => {
    if (isProcessingAnswer.current) return;
    isProcessingAnswer.current = true;
    
    // Zapisz, czy odpowiedź była poprawna dla tego pytania
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[currentIndex] = correct;
    setCorrectAnswers(newCorrectAnswers);
    
    // Przejdź do następnego pytania z opóźnieniem
    setTimeout(() => {
      if (currentIndex + 1 < reviewItems.length) {
        // Przejdź do następnego pytania
        setCurrentIndex(currentIndex + 1);
        isProcessingAnswer.current = false;
      } else {
        // Zakończ powtórkę
        finalizeReview(correct);
      }
    }, FEEDBACK_DELAY);
  };
  
  // Zakończenie sesji powtórki
  const finalizeReview = (lastAnswerCorrect: boolean) => {
    // Ustaw, że powtórka jest zakończona
    setIsFinished(true);
    
    // Aktualizacja odpowiedzi dla ostatniego pytania
    const finalCorrectAnswers = [...correctAnswers];
    finalCorrectAnswers[currentIndex] = lastAnswerCorrect;
    
    // Ustaw finalną liczbę punktów
    const finalScore = finalCorrectAnswers.filter(correct => correct).length;
    setCurrentScore(finalScore);
    setQuestionCount(totalCount);
    
    // Utworzenie nowej tablicy z błędami - tylko te, na które użytkownik odpowiedział niepoprawnie
    const newMistakes: MistakeRecord[] = [];
    
    // Dodaj do localStorage tylko błędy, na które użytkownik odpowiedział niepoprawnie
    reviewItems.forEach((item, index) => {
      if (!finalCorrectAnswers[index]) {
        newMistakes.push(item);
      }
    });
    
    console.log('Zapisuję błędy do powtórki:', newMistakes);
    
    // Zapisz nową listę błędów do localStorage
    localStorage.setItem('mistakes', JSON.stringify(newMistakes));
  };
  
  // Pokazuje komunikat ładowania
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0f172a] text-white">
        <div className="text-2xl">Ładowanie pytań...</div>
      </div>
    );
  }
  
  // Podsumowanie powtórki
  if (isFinished) {
    // Oblicz finalną liczbę poprawnych odpowiedzi
    const finalCorrectCount = correctAnswers.filter(correct => correct).length;
    
    // Sprawdź, czy są jakieś błędy do powtórzenia
    const hasMistakesForReview = localStorage.getItem('mistakes') !== '[]';
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f172a] text-white p-6">
        <div className="bg-[#1e293b] rounded-xl w-full max-w-md p-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">Powtórka zakończona!</h2>
          
          <div className="text-6xl mb-6">
            {finalCorrectCount === totalCount ? "🎯" : "👍"}
          </div>
          
          <div className="text-2xl font-bold mb-2">
            {finalCorrectCount} / {totalCount}
          </div>
          
          <p className="text-gray-300 text-lg mb-8">
            {finalCorrectCount === totalCount 
              ? "Świetnie! Wszystkie odpowiedzi poprawne." 
              : "Niepoprawne odpowiedzi zostały zapisane do kolejnej powtórki."}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('home')}
              className="bg-[#334155] hover:bg-[#475569] text-white font-bold py-4 px-6 rounded-xl"
            >
              Menu główne
            </button>
            
            <button
              onClick={() => setMode('review')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl"
              disabled={!hasMistakesForReview}
            >
              Kontynuuj powtórki
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Wyświetlanie pytania
  return (
    <>
      {reviewItems.length > 0 && currentIndex < reviewItems.length && (
        <Question
          isReviewMode={true}
          reviewItem={reviewItems[currentIndex]}
          reviewIndex={currentIndex}
          onAnswered={handleAnswered}
        />
      )}
    </>
  );
} 