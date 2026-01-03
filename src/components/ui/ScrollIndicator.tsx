import React from 'react';
import { motion } from 'framer-motion';

const ScrollIndicator: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-40 pointer-events-none"
    >
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Explore</span>
      <div className="h-16 w-[1px] bg-white/10 overflow-hidden relative">
        <motion.div 
          animate={{ y: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 w-full bg-white/60 blur-[1px]"
        />
      </div>
    </motion.div>
  );
};

export default ScrollIndicator;