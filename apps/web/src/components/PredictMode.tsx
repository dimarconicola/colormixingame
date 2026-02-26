import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Droplet, ArrowRight, Sparkles } from 'lucide-react';

const FORMULA = [
  { id: 'blue', name: 'Ultramarine', count: 2, color: '#118AB2' },
  { id: 'white', name: 'Titanium White', count: 3, color: '#FFFFFF' },
  { id: 'black', name: 'Mars Black', count: 1, color: '#073B4C' },
];

const OPTIONS = [
  { id: 'a', label: 'OPTION A', hex: '#9aaefa', color: '#9aaefa' },
  { id: 'b', label: 'OPTION B', hex: '#b3bad4', color: '#b3bad4' },
];

export default function PredictMode() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Left Column: Formula */}
      <div className="toca-card p-8 flex flex-col h-full bg-white relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-toca-blue/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ rotate: 10, scale: 0 }}
            animate={{ rotate: 2, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
            className="inline-block bg-toca-orange text-white font-black px-4 py-2 rounded-full border-[4px] border-toca-dark mb-6 shadow-[0_4px_0_0_#073B4C]"
          >
            PREDICT
          </motion.div>
          <h2 className="text-5xl font-black text-toca-dark mb-6 leading-tight">River Stone</h2>
          <p className="text-2xl text-toca-dark/80 font-bold mb-10 leading-snug">
            Predict a muted cool neutral from the listed formula.
          </p>
        </div>
        
        <h3 className="font-black text-toca-dark uppercase tracking-widest mb-6 text-xl">Formula</h3>
        <div className="flex flex-col gap-4 mb-10 relative z-10">
          {FORMULA.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', bounce: 0.4 }}
              whileHover={{ scale: 1.02, x: 10 }}
              className="bg-white rounded-[24px] p-4 border-[4px] border-toca-dark flex items-center gap-6 shadow-[0_6px_0_0_#073B4C] cursor-pointer group"
            >
              <div 
                className="w-16 h-16 rounded-full border-[4px] border-toca-dark shadow-[inset_0_4px_8px_rgba(0,0,0,0.2)] flex items-center justify-center relative overflow-hidden group-hover:rotate-12 transition-transform"
                style={{ backgroundColor: item.color }}
              >
                <div className="w-full h-1/2 bg-white/30 absolute top-0 left-0 transform -skew-y-12" />
              </div>
              <span className="font-black text-2xl text-toca-dark flex-1">
                {item.count} <span className="text-toca-dark/50 text-xl">x</span> {item.name.split(' ')[1] || item.name}
              </span>
              <div className="flex gap-1 bg-toca-bg p-2 rounded-full border-[4px] border-toca-dark/10">
                {Array.from({ length: item.count }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + i * 0.1, type: 'spring' }}
                  >
                    <Droplet size={24} className="text-toca-blue drop-shadow-sm" fill="currentColor" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <h3 className="font-black text-toca-dark uppercase tracking-widest mb-6 text-xl">Choose the resulting swatch</h3>
        <div className="grid grid-cols-2 gap-6 relative z-10">
          {OPTIONS.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, type: 'spring', bounce: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95, y: 0 }}
              onClick={() => setSelectedOption(option.id)}
              className={`bg-white rounded-[32px] border-[6px] border-toca-dark p-6 flex flex-col items-center gap-6 transition-all duration-200 relative overflow-hidden ${
                selectedOption === option.id 
                  ? 'shadow-[0_0_0_0_#073B4C] translate-y-[8px] bg-toca-blue/10' 
                  : 'shadow-[0_8px_0_0_#073B4C]'
              }`}
            >
              {selectedOption === option.id && (
                <div className="absolute inset-0 bg-toca-blue/5 animate-pulse-glow" />
              )}
              <span className="font-black text-lg text-toca-dark/60 tracking-wider relative z-10">{option.label}</span>
              <div 
                className="w-32 h-32 rounded-full border-[6px] border-toca-dark shadow-[inset_0_4px_12px_rgba(0,0,0,0.2)] relative overflow-hidden z-10"
                style={{ backgroundColor: option.color }}
              >
                 <div className="w-full h-1/2 bg-white/40 absolute top-0 left-0 transform -skew-y-12" />
              </div>
              <span className="font-mono font-black text-xl text-toca-dark bg-white px-4 py-2 rounded-full border-[4px] border-toca-dark relative z-10">{option.hex}</span>
              
              <AnimatePresence>
                {selectedOption === option.id && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                    className="absolute -top-4 -right-4 bg-toca-green text-white rounded-full p-2 border-[4px] border-toca-dark shadow-[0_4px_0_0_#073B4C] z-20"
                  >
                    <Check size={32} strokeWidth={4} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="toca-card p-8 flex flex-col h-full bg-gradient-to-br from-toca-bg to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/50 rounded-full blur-3xl pointer-events-none" />
        
        <h3 className="font-black text-toca-dark uppercase tracking-widest mb-6 text-xl relative z-10">Current Selection</h3>
        
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[500px] z-10">
          <AnimatePresence mode="wait">
            {selectedOption ? (
              <motion.div
                key={selectedOption}
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 15 }}
                transition={{ type: 'spring', bounce: 0.6 }}
                className="flex flex-col items-center gap-8 w-full"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-8 bg-toca-yellow/20 rounded-full blur-xl"
                  />
                  <div 
                    className="w-72 h-72 rounded-[64px] border-[12px] border-white shadow-[0_24px_0_0_rgba(0,0,0,0.1),0_0_0_6px_#073B4C] relative overflow-hidden transform rotate-3"
                    style={{ backgroundColor: OPTIONS.find(o => o.id === selectedOption)?.color }}
                  >
                    {/* Glossy reflection */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent skew-y-12 transform origin-top-left" />
                    
                    {/* Inner shadow */}
                    <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] pointer-events-none" />
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-6 -right-6 text-toca-yellow"
                  >
                    <Sparkles size={48} fill="currentColor" />
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white px-10 py-6 rounded-[32px] border-[6px] border-toca-dark shadow-[0_8px_0_0_#073B4C] transform -rotate-2"
                >
                  <span className="font-black text-3xl text-toca-dark uppercase tracking-wider">
                    {OPTIONS.find(o => o.id === selectedOption)?.label}
                  </span>
                </motion.div>

                <motion.button 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="toca-button toca-button-primary py-6 px-12 mt-8 w-full max-w-md flex gap-4 text-2xl group"
                >
                  Confirm Guess
                  <ArrowRight size={32} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center flex flex-col items-center"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-64 h-64 rounded-[64px] border-[8px] border-dashed border-toca-dark/20 flex items-center justify-center mb-10 bg-white/50 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
                  <span className="text-8xl text-toca-dark/20 font-black relative z-10">?</span>
                </motion.div>
                <div className="bg-white px-8 py-4 rounded-full border-[4px] border-toca-dark shadow-[0_4px_0_0_#073B4C]">
                  <p className="text-2xl font-black text-toca-dark">
                    Select an option to preview!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
