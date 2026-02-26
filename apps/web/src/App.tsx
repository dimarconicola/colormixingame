import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Volume2, Eye, Sparkles } from 'lucide-react';
import SolveMode from './components/SolveMode';
import PredictMode from './components/PredictMode';
import FindTwinMode from './components/FindTwinMode';
import ColorDiaryMode from './components/ColorDiaryMode';

type GameMode = 'solve' | 'predict' | 'twin' | 'diary';

export default function App() {
  const [activeMode, setActiveMode] = useState<GameMode>('solve');

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col max-w-7xl mx-auto relative">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-toca-pink/10 rounded-full blur-2xl animate-float" />
        <div className="absolute top-[40%] right-[10%] w-48 h-48 bg-toca-yellow/10 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute bottom-[20%] left-[15%] w-40 h-40 bg-toca-blue/10 rounded-full blur-2xl animate-float" />
      </div>

      {/* Header / Navigation Card */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
        className="toca-card p-6 md:p-8 mb-8 bg-white/90 backdrop-blur-xl z-10 relative"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-20 h-20 bg-toca-yellow rounded-[24px] border-[6px] border-toca-dark shadow-[0_8px_0_0_#073B4C] flex items-center justify-center transform -rotate-6 hidden md:flex relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 w-full h-1/2" />
              <div className="w-10 h-10 bg-toca-pink rounded-full border-[4px] border-toca-dark shadow-inner" />
            </motion.div>
            <div>
              <h2 className="text-toca-blue font-black tracking-widest uppercase text-lg mb-2 flex items-center gap-2">
                <Sparkles size={20} className="text-toca-yellow" />
                Color Mixing Game
              </h2>
              <h1 className="text-5xl md:text-6xl font-black text-toca-dark leading-none">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeMode}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="inline-block"
                  >
                    {activeMode === 'solve' && 'Solve Mode'}
                    {activeMode === 'predict' && 'Predict Mode'}
                    {activeMode === 'twin' && 'Find the Twin'}
                    {activeMode === 'diary' && 'Color Diary'}
                  </motion.span>
                </AnimatePresence>
              </h1>
              <p className="text-xl text-toca-dark/70 mt-4 font-bold max-w-2xl leading-snug">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-block"
                  >
                    {activeMode === 'solve' && 'Match the target swatch by dragging pigments into the bowl!'}
                    {activeMode === 'predict' && 'Predict the resulting swatch from a pigment formula.'}
                    {activeMode === 'twin' && 'Find the exact twin swatch under contextual perception variants.'}
                    {activeMode === 'diary' && 'Your collection of discovered colors.'}
                  </motion.span>
                </AnimatePresence>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-4 bg-toca-bg p-3 rounded-[32px] border-[6px] border-toca-dark shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)]">
              <motion.button whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }} className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-[4px] border-toca-dark shadow-[0_4px_0_0_#073B4C] active:translate-y-[4px] active:shadow-none transition-all text-toca-blue relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 w-full h-1/2" />
                <Volume2 size={32} strokeWidth={3} className="relative z-10" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-[4px] border-toca-dark shadow-[0_4px_0_0_#073B4C] active:translate-y-[4px] active:shadow-none transition-all text-toca-pink relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 w-full h-1/2" />
                <Eye size={32} strokeWidth={3} className="relative z-10" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }} className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-[4px] border-toca-dark shadow-[0_4px_0_0_#073B4C] active:translate-y-[4px] active:shadow-none transition-all text-toca-green relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 w-full h-1/2" />
                <Settings size={32} strokeWidth={3} className="relative z-10" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="flex gap-4 mt-8 overflow-x-auto pb-4 no-scrollbar relative">
          <button 
            onClick={() => setActiveMode('solve')}
            className={`toca-pill whitespace-nowrap ${activeMode === 'solve' ? 'active' : ''}`}
          >
            Solve
          </button>
          <button 
            onClick={() => setActiveMode('predict')}
            className={`toca-pill whitespace-nowrap ${activeMode === 'predict' ? 'active' : ''}`}
          >
            Predict
          </button>
          <button 
            onClick={() => setActiveMode('twin')}
            className={`toca-pill whitespace-nowrap ${activeMode === 'twin' ? 'active' : ''}`}
          >
            Find the Twin
          </button>
          <button 
            onClick={() => setActiveMode('diary')}
            className={`toca-pill whitespace-nowrap ${activeMode === 'diary' ? 'active' : ''}`}
          >
            Color Diary
          </button>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {activeMode === 'solve' && <SolveMode key="solve" />}
          {activeMode === 'predict' && <PredictMode key="predict" />}
          {activeMode === 'twin' && <FindTwinMode key="twin" />}
          {activeMode === 'diary' && <ColorDiaryMode key="diary" />}
        </AnimatePresence>
      </main>
    </div>
  );
}


