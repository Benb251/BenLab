import React from 'react';
import { Aperture } from 'lucide-react';
import { motion } from 'framer-motion';
import NeonBadge from './NeonBadge';

const Navbar: React.FC = () => {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 text-white"
    >
      <div className="flex items-center gap-4 cursor-pointer group">
        <Aperture className="w-8 h-8 text-cyan-400 group-hover:rotate-90 transition-transform duration-700 ease-in-out drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        <div className="flex flex-col">
          <span className="font-['Orbitron'] text-xl tracking-[0.2em] font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white/80">BenLab_Studio</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NeonBadge color="pink">Pro Studio</NeonBadge>
      </div>
    </motion.nav>
  );
};

export default Navbar;