import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RefreshCw, Sparkles } from 'lucide-react';

const PIGMENTS = [
  { id: 'yellow', name: 'Hansa Yellow', color: '#FFD166', hex: '#FFD166' },
  { id: 'blue', name: 'Ultramarine', color: '#118AB2', hex: '#118AB2' },
  { id: 'white', name: 'Titanium White', color: '#FFFFFF', hex: '#FFFFFF' },
  { id: 'black', name: 'Mars Black', color: '#073B4C', hex: '#073B4C' },
];

export default function SolveMode() {
  const [drops, setDrops] = useState<{ id: string; color: string; x: number; y: number }[]>([]);
  const [mixedColor, setMixedColor] = useState<string | null>(null);
  const [isMixing, setIsMixing] = useState(false);
  const bowlRef = useRef<HTMLDivElement>(null);

  const handleAddDrop = (pigment: typeof PIGMENTS[0]) => {
    if (drops.length >= 8) return;
    
    const newDrops = [...drops, { 
      id: Math.random().toString(), 
      color: pigment.color, 
      x: Math.random() * 80 - 40, 
      y: Math.random() * 80 - 40 
    }];
    setDrops(newDrops);
    
    setIsMixing(true);
    setTimeout(() => {
      if (newDrops.length > 2) {
        setMixedColor('#9a8e75');
      } else {
        setMixedColor(pigment.color);
      }
      setIsMixing(false);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Left Column: Challenge Info */}
      <div className="toca-card p-8 flex flex-col h-full bg-white relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-toca-yellow/20 rounded-full blur-3xl animate-pulse-glow" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: -3, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
            className="inline-block bg-toca-purple text-white font-black px-4 py-2 rounded-full border-[4px] border-toca-dark mb-6 shadow-[0_4px_0_0_#073B4C]"
          >
            LEVEL 1
          </motion.div>
          <h2 className="text-5xl font-black text-toca-dark mb-6 leading-tight">Moss Field</h2>
          <p className="text-2xl text-toca-dark/80 font-bold mb-10 leading-snug">
            Reach a muted natural green using yellow, blue, and black.
          </p>
        </div>
        
        <div className="bg-toca-bg rounded-[32px] p-6 mb-8 border-[6px] border-toca-dark shadow-[inset_0_8px_16px_rgba(0,0,0,0.1)] relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="font-black text-xl text-toca-dark uppercase tracking-wider">Drop Budget</span>
            <motion.span 
              key={drops.length}
              initial={{ scale: 1.5, color: '#EF476F' }}
              animate={{ scale: 1, color: '#118AB2' }}
              className="font-black text-3xl bg-white px-4 py-1 rounded-full border-[4px] border-toca-dark shadow-[0_4px_0_0_#073B4C]"
            >
              {drops.length}/8
            </motion.span>
          </div>
          <div className="flex gap-2 h-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div 
                key={i} 
                initial={false}
                animate={{ 
                  scale: i < drops.length ? [1, 1.2, 1] : 1,
                  backgroundColor: i < drops.length ? '#118AB2' : '#FFFFFF'
                }}
                className={`flex-1 rounded-full border-[4px] border-toca-dark ${i < drops.length ? 'shadow-[0_4px_0_0_#073B4C]' : 'shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]'}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-6 relative z-10">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="toca-button toca-button-tertiary py-6 w-full flex gap-4 text-3xl group">
            <Play fill="currentColor" size={32} className="group-hover:scale-110 transition-transform" />
            Start!
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="toca-button bg-white text-toca-dark py-4 w-full flex gap-4 text-xl group">
            <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            New Target
          </motion.button>
        </div>
      </div>

      {/* Middle Column: Mixing Area */}
      <div className="toca-card p-8 lg:col-span-2 flex flex-col relative overflow-hidden min-h-[600px] bg-gradient-to-b from-white to-toca-bg">
        {/* Target Color Badge */}
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [3, 5, 3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 right-8 bg-white border-[6px] border-toca-dark rounded-[32px] p-4 shadow-[0_8px_0_0_#073B4C] z-20 flex items-center gap-6"
        >
          <div>
            <div className="text-lg font-black text-toca-dark/60 uppercase tracking-widest mb-1">Target</div>
            <div className="font-mono font-black text-2xl text-toca-dark">#9a8e75</div>
          </div>
          <div className="w-20 h-20 rounded-full border-[6px] border-toca-dark shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{ backgroundColor: '#9a8e75' }}>
             <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 transform -skew-y-12" />
          </div>
        </motion.div>

        {/* Mixing Bowl */}
        <div className="flex-1 flex items-center justify-center relative mt-12">
          <motion.div 
            ref={bowlRef}
            animate={isMixing ? { scale: [1, 0.95, 1.05, 1], rotate: [0, -2, 2, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="w-72 h-72 md:w-96 md:h-96 rounded-full border-[12px] border-toca-yellow bg-white shadow-[0_24px_0_0_#073B4C,inset_0_-20px_40px_rgba(0,0,0,0.1)] relative flex items-center justify-center overflow-hidden"
          >
            {/* Bowl inner shadow for depth */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_20px_40px_rgba(0,0,0,0.15)] pointer-events-none z-20" />
            
            {/* Mixed Liquid */}
            <motion.div 
              className="absolute inset-0 origin-bottom"
              animate={{ 
                backgroundColor: mixedColor || 'transparent',
                scaleY: mixedColor ? 1 : 0,
                opacity: mixedColor ? 1 : 0
              }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
            >
              {/* Liquid surface reflection */}
              {mixedColor && (
                <motion.div 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-10 w-40 h-20 bg-white/20 rounded-full blur-md transform -rotate-12" 
                />
              )}
            </motion.div>
            
            {/* Drops Animation */}
            <AnimatePresence>
              {drops.map((drop) => (
                <motion.div
                  key={drop.id}
                  initial={{ y: -400, scale: 0.5, opacity: 0 }}
                  animate={{ 
                    y: drop.y, 
                    scale: [0.5, 1.5, 1], 
                    opacity: 1,
                    borderRadius: ['50%', '50%', '40% 60% 70% 30% / 40% 50% 60% 50%', '50%']
                  }}
                  transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
                  className="absolute w-16 h-16 border-[4px] border-toca-dark/20 shadow-lg z-10 flex items-center justify-center"
                  style={{ backgroundColor: drop.color, left: `calc(50% + ${drop.x}px)`, top: `calc(50% + ${drop.y}px)` }}
                >
                  <div className="w-full h-1/2 bg-white/40 absolute top-0 left-0 rounded-t-full" />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Mixing Sparkles */}
            <AnimatePresence>
              {isMixing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: 180 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute z-30 text-white drop-shadow-md"
                >
                  <Sparkles size={80} strokeWidth={2} fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Pigment Palette */}
        <div className="mt-12 bg-white rounded-[40px] p-6 border-[6px] border-toca-dark shadow-[0_8px_0_0_#073B4C] flex justify-center gap-6 md:gap-12 relative z-20">
          {PIGMENTS.map((pigment, index) => (
            <motion.button
              key={pigment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', bounce: 0.5 }}
              whileHover={{ scale: 1.15, y: -10 }}
              whileTap={{ scale: 0.9, y: 0 }}
              onClick={() => handleAddDrop(pigment)}
              className="relative group flex flex-col items-center gap-4"
            >
              <div 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[6px] border-toca-dark shadow-[0_8px_0_0_#073B4C,inset_0_-4px_8px_rgba(0,0,0,0.2)] transition-all group-active:shadow-[0_0px_0_0_#073B4C] group-active:translate-y-[8px] flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: pigment.color }}
              >
                {/* Paint tube highlight */}
                <div className="w-full h-1/2 bg-white/30 absolute top-0 left-0 transform -skew-y-12" />
              </div>
              <span className="font-black text-lg text-toca-dark hidden md:block uppercase tracking-wider">{pigment.name.split(' ')[1] || pigment.name}</span>
              
              {/* Drop counter badge */}
              <AnimatePresence>
                {drops.filter(d => d.color === pigment.color).length > 0 && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-4 -right-4 bg-toca-pink text-white border-[4px] border-toca-dark rounded-full w-10 h-10 flex items-center justify-center text-xl font-black shadow-[0_4px_0_0_#073B4C]"
                  >
                    {drops.filter(d => d.color === pigment.color).length}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
