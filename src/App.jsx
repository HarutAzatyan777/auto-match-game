import { motion, AnimatePresence } from 'framer-motion';
import GameBoard from './components/GameBoard';
import Garage from './components/Garage';
import useGameStore from './store/useGameStore';
import './App.css';

function App() {
  const { activeTab, setActiveTab } = useGameStore();

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-slate-950 text-slate-100 pb-24 overflow-x-hidden pt-4 sm:pt-8">
      {/* Dynamic Header */}
      <header className="mb-4">
        <h1 className="text-2xl font-black tracking-tight text-center bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
          ⚙️ AUTO RESTORE ⚙️
        </h1>
      </header>

      {/* Main View Area with sliding/fading animation */}
      <div className="w-full flex justify-center relative px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'board' ? (
            <motion.div
              key="board"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18 }}
              className="w-full flex justify-center"
            >
              <GameBoard />
            </motion.div>
          ) : (
            <motion.div
              key="garage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="w-full flex justify-center"
            >
              <Garage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm h-16 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-2xl flex items-center justify-around z-40 px-2">
        
        {/* Board Tab */}
        <button
          onClick={() => setActiveTab('board')}
          className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center relative transition-colors duration-200 ${
            activeTab === 'board' ? 'text-sky-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {activeTab === 'board' && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-slate-800/60 border border-slate-700/30 rounded-xl -z-10 shadow-inner"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
          )}
          {/* Grid SVG Icon */}
          <svg
            className="w-5 h-5 mb-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          <span className="text-[10px] tracking-wider uppercase">Puzzle</span>
        </button>

        {/* Garage Tab */}
        <button
          onClick={() => setActiveTab('garage')}
          className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center relative transition-colors duration-200 ${
            activeTab === 'garage' ? 'text-sky-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {activeTab === 'garage' && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-slate-800/60 border border-slate-700/30 rounded-xl -z-10 shadow-inner"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
          )}
          {/* Wrench/Gear SVG Icon */}
          <svg
            className="w-5 h-5 mb-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-[10px] tracking-wider uppercase">Garage</span>
        </button>

      </nav>
    </main>
  );
}

export default App;
