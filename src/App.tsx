import './App.css'
import { AppProvider, useAppContext } from './contexts/AppContext'
import Home from './components/Home'
import Question from './components/Question'
import Review from './components/Review'
import Results from './components/Results'
import { useEffect } from 'react'

// Main application component that will render different screens based on the current mode
function AppContent() {
  const { mode } = useAppContext()

  // Funkcja dostosowująca wysokość, aby uwzględnić pasek adresu przeglądarki
  useEffect(() => {
    // Dostosowanie wysokości dla przeglądarek mobilnych
    const adjustHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Wywołaj od razu i przy każdej zmianie rozmiaru
    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    window.addEventListener('orientationchange', adjustHeight);

    return () => {
      window.removeEventListener('resize', adjustHeight);
      window.removeEventListener('orientationchange', adjustHeight);
    };
  }, []);

  // Render different components based on the current mode
  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 min-h-screen pb-safe-area">
      <div className="w-full h-full max-w-md mb-20"> {/* Dodano margines na dole */}
        {mode === 'home' && <Home />}
        {mode === 'multiplication' && <Question />}
        {mode === 'division' && <Question />}
        {/* Settings will be shown from the Home component by changing mode directly to multiplication or division */}
        {mode === 'review' && <Review />}
        {mode === 'results' && <Results />}
      </div>
    </div>
  )
}

// Main App component that wraps everything with the context provider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
