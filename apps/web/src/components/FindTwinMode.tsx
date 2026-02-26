import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, EyeOff, Eye, ArrowRight } from 'lucide-react';

const TARGET = { hex: '#729d76', color: '#729d76' };

const OPTIONS = [
  { id: 'a', label: 'OPTION A', hex: '#79a071', color: '#79a071' },
  { id: 'b', label: 'OPTION B', hex: '#729d76', color: '#729d76' },
  { id: 'c', label: 'OPTION C', hex: '#6f9a74', color: '#6f9a74' },
  { id: 'd', label: 'OPTION D', hex: '#75a078', color: '#75a078' },
];

export default function FindTwinMode() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [assistOn, setAssistOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedOption(id);
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Left Column: Target & Options */}
      <div className="toca-card p-8 flex flex-col h-full bg-white relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-toca-green/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <motion.div 
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: -2, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
                className="inline-block bg-toca-blue text-white font-black px-4 py-2 rounded-full border-[4px] border-toca-dark mb-4 shadow-[0_4px_0_0_#073B4C]"
              >
                TWIN MATCH
              </motion.div>
              <h2 className="text-5xl font-black text-toca-dark mb-4 leading-tight">Sage Field</h2>
            </div>
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="bg-toca-yellow text-toca-dark font-black px-4 py-2 rounded-full border-[4px] border-toca-dark shadow-[0_4px_0_0_#073B4C] transform rotate-3"
            >
              MEDIUM
            </motion.div>
          </div>
          
          <p className="text-2xl text-toca-dark/80 font-bold mb-8 leading-snug">
            Pick the exact sage swatch while value and hue shifts are subtle.
          </p>
        </div>

        {/* Context Box */}
        <div className="bg-[#e0e0e0] rounded-[40px] p-10 mb-10 border-[6px] border-toca-dark shadow-[inset_0_8px_16px_rgba(0,0,0,0.15)] flex items-center justify-center relative overflow-hidden z-10 group">
          <div className="absolute top-4 left-6 text-sm font-black text-toca-dark/40 uppercase tracking-widest">Context: Neutral Studio</div>
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-40 h-40 rounded-full border-[6px] border-toca-dark shadow-[0_12px_0_0_rgba(0,0,0,0.2),inset_0_4px_12px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center gap-2 relative overflow-hidden"
            style={{ backgroundColor: TARGET.color }}
          >
            <div className="w-full h-1/2 bg-white/20 absolute top-0 left-0 transform -skew-y-12" />
          </motion.div>
          
          <div className="absolute bottom-6 font-mono font-black text-xl text-toca-dark bg-white px-6 py-2 rounded-full border-[4px] border-toca-dark shadow-[0_4px_0_0_#073B4C]">
            {TARGET.hex}
          </div>

          {/* Scanning Line Effect */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ top: '-10%' }}
                animate={{ top: '110%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="absolute left-0 w-full h-12 bg-gradient-to-b from-transparent via-white/40 to-transparent z-30 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        <h3 className="font-black text-toca-dark uppercase tracking-widest mb-6 text-xl relative z-10">Choose the exact twin</h3>
        <div className="grid grid-cols-2 gap-6 relative z-10">
          {OPTIONS.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', bounce: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95, y: 0 }}
              onClick={() => handleSelect(option.id)}
              className={`bg-white rounded-[32px] border-[6px] border-toca-dark p-6 flex flex-col items-center gap-6 transition-all duration-200 relative overflow-hidden ${
                selectedOption === option.id 
                  ? 'shadow-[0_0_0_0_#073B4C] translate-y-[8px] bg-toca-green/10' 
                  : 'shadow-[0_8px_0_0_#073B4C]'
              }`}
            >
              {selectedOption === option.id && (
                <div className="absolute inset-0 bg-toca-green/5 animate-pulse-glow" />
              )}
              <span className="font-black text-lg text-toca-dark/60 tracking-wider relative z-10">{option.label}</span>
              <div 
                className="w-24 h-24 rounded-full border-[6px] border-toca-dark shadow-[inset_0_4px_12px_rgba(0,0,0,0.2)] relative overflow-hidden z-10"
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

      {/* Right Column: Preview & Assist */}
      <div className="toca-card p-8 flex flex-col h-full bg-gradient-to-br from-toca-bg to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/50 rounded-full blur-3xl pointer-events-none" />
        
        <h3 className="font-black text-toca-dark uppercase tracking-widest mb-6 text-xl relative z-10">Current Selection</h3>
        
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[500px] z-10">
          <AnimatePresence mode="wait">
            {selectedOption ? (
              <motion.div
                key={selectedOption}
                initial={{ scale: 0, rotate: 10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -10 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="flex flex-col items-center gap-8 w-full"
              >
                <div className="flex items-center gap-6 w-full justify-center relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-toca-yellow/10 rounded-full blur-xl"
                  />
                  {/* Target Comparison */}
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <span className="font-black text-toca-dark/60 text-lg uppercase tracking-wider">Target</span>
                    <div 
                      className="w-40 h-40 rounded-[40px] border-[8px] border-toca-dark shadow-[0_12px_0_0_#073B4C] relative overflow-hidden transform -rotate-3"
                      style={{ backgroundColor: TARGET.color }}
                    >
                      <div className="w-full h-1/2 bg-white/30 absolute top-0 left-0 transform -skew-y-12" />
                    </div>
                  </div>
                  
                  <span className="text-6xl font-black text-toca-dark/20 px-4 relative z-10">VS</span>
                  
                  {/* Selected Comparison */}
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <span className="font-black text-toca-dark/60 text-lg uppercase tracking-wider">Selected</span>
                    <div 
                      className="w-40 h-40 rounded-[40px] border-[8px] border-toca-dark shadow-[0_12px_0_0_#073B4C] relative overflow-hidden transform rotate-3"
                      style={{ backgroundColor: OPTIONS.find(o => o.id === selectedOption)?.color }}
                    >
                      <div className="w-full h-1/2 bg-white/30 absolute top-0 left-0 transform -skew-y-12" />
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white px-10 py-6 rounded-[32px] border-[6px] border-toca-dark shadow-[0_8px_0_0_#073B4C] mt-8 transform rotate-1"
                >
                  <span className="font-black text-3xl text-toca-dark uppercase tracking-wider">
                    Ready to check?
                  </span>
                </motion.div>

                <motion.button 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="toca-button toca-button-tertiary py-6 px-12 mt-4 w-full max-w-md flex gap-4 text-2xl group"
                >
                  Verify Match
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
                    Select a swatch to compare!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Assist Toggle */}
        <div className="mt-8 bg-white rounded-[32px] p-8 border-[6px] border-toca-dark shadow-[0_8px_0_0_#073B4C] relative overflow-hidden z-10">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-toca-yellow/20 rounded-full blur-2xl" />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h4 className="font-black text-2xl text-toca-dark flex items-center gap-3">
              {assistOn ? <Eye size={32} className="text-toca-green" /> : <EyeOff size={32} className="text-toca-pink" />}
              Color Assist
            </h4>
            <button 
              onClick={() => setAssistOn(!assistOn)}
              className={`w-24 h-12 rounded-full border-[6px] border-toca-dark relative transition-colors shadow-[inset_0_4px_8px_rgba(0,0,0,0.2)] ${assistOn ? 'bg-toca-green' : 'bg-toca-bg'}`}
            >
              <motion.div 
                className="w-8 h-8 bg-white border-[4px] border-toca-dark rounded-full absolute top-0.5 shadow-sm"
                animate={{ left: assistOn ? '48px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
          <p className="text-lg font-bold text-toca-dark/70 relative z-10">
            Balanced gray surrounds remove strong warm/cool bias.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
