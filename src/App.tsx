import './App.css'
import { AppProvider, useAppContext } from './contexts/AppContext'
import Home from './components/Home'
import Question from './components/Question'
import Review from './components/Review'
import Results from './components/Results'

// Main application component that will render different screens based on the current mode
function AppContent() {
  const { mode } = useAppContext()

  // Render different components based on the current mode
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="w-full h-full max-w-md">
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
