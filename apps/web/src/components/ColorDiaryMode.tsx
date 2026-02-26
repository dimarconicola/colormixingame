import { motion, AnimatePresence } from 'motion/react';
import { Lock, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';

const UNLOCKED_COLORS = [
  { id: '1', name: 'Moss Field', hex: '#9a8e75', color: '#9a8e75', date: 'Today' },
  { id: '2', name: 'River Stone', hex: '#b3bad4', color: '#b3bad4', date: 'Yesterday' },
  { id: '3', name: 'Sage Field', hex: '#729d76', color: '#729d76', date: '2 days ago' },
  { id: '4', name: 'Sunset Glow', hex: '#ff9e7a', color: '#ff9e7a', date: 'Last week' },
  { id: '5', name: 'Ocean Deep', hex: '#1a4b6e', color: '#1a4b6e', date: 'Last week' },
];

const LOCKED_COUNT = 15;

export default function ColorDiaryMode() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className="toca-card p-8 bg-white relative overflow-hidden min-h-[800px]"
    >
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-toca-pink/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-toca-blue/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <motion.div 
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: -2, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
            className="inline-block bg-toca-pink text-white font-black px-4 py-2 rounded-full border-[4px] border-toca-dark mb-4 shadow-[0_4px_0_0_#073B4C]"
          >
            COLLECTION
          </motion.div>
          <h2 className="text-5xl font-black text-toca-dark mb-4 leading-tight flex items-center gap-4">
            My Color Diary
            <Star className="text-toca-yellow fill-current animate-pulse" size={40} />
          </h2>
          <p className="text-2xl text-toca-dark/80 font-bold leading-snug">
            You've discovered <span className="text-toca-pink">{UNLOCKED_COLORS.length}</span> out of {UNLOCKED_COLORS.length + LOCKED_COUNT} colors!
          </p>
        </div>
        
        <motion.div 
          whileHover={{ rotate: 5, scale: 1.05 }}
          className="bg-toca-yellow px-6 py-4 rounded-[32px] border-[6px] border-toca-dark shadow-[0_8px_0_0_#073B4C] flex items-center gap-4 transform rotate-2"
        >
          <Star size={32} className="text-toca-dark" fill="currentColor" />
          <span className="font-black text-2xl text-toca-dark uppercase tracking-wider">Level 5</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 relative z-10">
        {/* Unlocked Colors */}
        {UNLOCKED_COLORS.map((color, index) => (
          <motion.div
            key={color.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: 'spring', bounce: 0.5 }}
            whileHover={{ scale: 1.05, y: -10, rotate: index % 2 === 0 ? 2 : -2 }}
            onHoverStart={() => setHoveredId(color.id)}
            onHoverEnd={() => setHoveredId(null)}
            className="bg-white rounded-[32px] border-[6px] border-toca-dark p-4 flex flex-col items-center gap-4 shadow-[0_8px_0_0_#073B4C] cursor-pointer group relative overflow-hidden"
          >
            {/* Holographic shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full" style={{ transitionDuration: '1s' }} />

            <div 
              className="w-full aspect-square rounded-[24px] border-[6px] border-toca-dark shadow-[inset_0_4px_12px_rgba(0,0,0,0.2)] relative overflow-hidden z-10"
              style={{ backgroundColor: color.color }}
            >
              {/* Paint tube highlight */}
              <div className="w-full h-1/2 bg-white/30 absolute top-0 left-0 transform -skew-y-12" />
              
              <AnimatePresence>
                {hoveredId === color.id && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-toca-dark/20 flex items-center justify-center backdrop-blur-sm"
                  >
                    <span className="font-mono font-black text-xl text-white bg-toca-dark/80 px-4 py-2 rounded-full border-[4px] border-white/20">
                      {color.hex}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="text-center w-full relative z-10">
              <h3 className="font-black text-lg text-toca-dark truncate">{color.name}</h3>
              <p className="font-mono font-bold text-sm text-toca-dark/60">{color.hex}</p>
            </div>
            
            {/* New Badge */}
            {index === 0 && (
              <motion.div 
                animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-toca-green text-white font-black px-3 py-1 rounded-full border-[4px] border-toca-dark shadow-[0_4px_0_0_#073B4C] transform rotate-12 flex items-center gap-1 z-30"
              >
                <Sparkles size={14} /> NEW!
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Locked Slots */}
        {Array.from({ length: LOCKED_COUNT }).map((_, index) => (
          <motion.div
            key={`locked-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (UNLOCKED_COLORS.length + index) * 0.05 }}
            className="bg-toca-bg/50 rounded-[32px] border-[6px] border-dashed border-toca-dark/20 p-4 flex flex-col items-center justify-center gap-4 aspect-[3/4] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
            <div className="w-16 h-16 rounded-full bg-toca-dark/10 flex items-center justify-center mb-2 relative z-10 group-hover:scale-110 transition-transform">
              <Lock size={32} className="text-toca-dark/30" />
            </div>
            <span className="font-black text-toca-dark/30 uppercase tracking-widest text-center relative z-10">
              Keep<br/>Mixing!
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
