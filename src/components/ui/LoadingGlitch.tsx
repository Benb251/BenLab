import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Terminal, Activity, Lock, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingGlitchProps {
  mode: 'idle' | 'loading';
  text?: string;
}

const LoadingGlitch: React.FC<LoadingGlitchProps> = ({ mode, text }) => {
  const [logLines, setLogLines] = useState<string[]>([]);

  // Simulation of system logs
  useEffect(() => {
    if (mode === 'loading') {
      const logs = [
        "Allocating Tensors...",
        "Handshaking with Neural Core...",
        "De-noising latent space...",
        "Upscaling vector fields...",
        "Applying aesthetic gradients...",
        "Finalizing render buffer..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < logs.length) {
          setLogLines(prev => [logs[i], ...prev].slice(0, 4));
          i++;
        }
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLogLines([]);
    }
  }, [mode]);

  const glitchVariants: Variants = {
    idle: { 
      opacity: [0.3, 0.6, 0.3],
      x: 0,
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    loading: {
      opacity: [1, 0.8, 0.2, 1, 0.5, 1],
      x: [0, -2, 2, -1, 0],
      transition: { duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 2 }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 relative overflow-hidden bg-zinc-950 select-none">
      
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        
        {/* Icon Cluster */}
        <div className="relative">
          <motion.div
            animate={mode === 'loading' ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className={cn(
              "w-20 h-20 border-[1px] rounded-full flex items-center justify-center",
              mode === 'loading' ? "border-orange-500 border-t-transparent" : "border-zinc-800"
            )}
          >
             {mode === 'loading' ? (
                <Cpu className="w-8 h-8 text-orange-500 animate-pulse" />
             ) : (
                <Lock className="w-8 h-8 text-zinc-700" />
             )}
          </motion.div>
          
          {/* Static Ring for Idle */}
          {mode === 'idle' && (
             <div className="absolute inset-0 border border-zinc-800 rounded-full scale-125 opacity-20" />
          )}
        </div>

        {/* Text Output */}
        <div className="text-center space-y-2">
          <motion.h2
            variants={glitchVariants}
            animate={mode}
            className={cn(
              "font-['Oswald'] text-3xl font-bold tracking-[0.2em] uppercase",
              mode === 'loading' ? "text-orange-500" : "text-zinc-600"
            )}
          >
            {text || (mode === 'loading' ? "DECODING SIGNAL" : "AWAITING INPUT")}
          </motion.h2>

          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            {mode === 'loading' ? "Running Generative Protocols // V2.0" : "System Standby // Ready for Sequence"}
          </p>
        </div>

        {/* Loading Logs */}
        {mode === 'loading' && (
          <div className="w-64 h-24 mt-4 font-mono text-[9px] text-zinc-400 border-l border-zinc-800 pl-3 flex flex-col justify-end overflow-hidden">
             {logLines.map((line, idx) => (
               <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1 - (idx * 0.2), x: 0 }}
                  className="truncate"
               >
                 {`> ${line}`}
               </motion.div>
             ))}
             <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-3 bg-orange-500 animate-pulse" />
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoadingGlitch;