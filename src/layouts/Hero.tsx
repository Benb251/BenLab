import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import ToolsMenu from './ToolsMenu';
import { HyperText } from '@/components/ui';
import FreeGeneration from '@/features/generation/FreeGeneration';
import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation } from '@/lib/translations';

// --- CONFIGURATION: CUSTOM ASSETS ---
const BG_IMAGE_URL = "https://cdn.corenexis.com/files/c/15392472.png";
const FG_IMAGE_URL = "https://cdn.corenexis.com/files/c/84347672.png";
// -------------------------------------------------------------

type ViewState = 'menu' | 'free-gen' | null;

const Hero: React.FC = () => {
  const { language } = useSettingsStore();
  const t = useTranslation(language);
  const [activeView, setActiveView] = useState<ViewState>(null);

  // Derived state for background effects
  const isMenuOpen = activeView !== null;
  const isBlurActive = isMenuOpen;

  // --- MOUSE TRACKING ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring configuration
  const springConfig = { damping: 40, stiffness: 200, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // --- PARALLAX TRANSFORMS ---

  // LAYER 0: Background
  const bgX = useTransform(smoothMouseX, [-1, 1], [30, -30]);
  const bgY = useTransform(smoothMouseY, [-1, 1], [30, -30]);

  // LAYER 1: Typography
  const textX = useTransform(smoothMouseX, [-1, 1], [15, -15]);
  const textY = useTransform(smoothMouseY, [-1, 1], [15, -15]);
  const textRotateX = useTransform(smoothMouseY, [-1, 1], [5, -5]);
  const textRotateY = useTransform(smoothMouseX, [-1, 1], [-5, 5]);

  // LAYER 2: Foreground
  const fgX = useTransform(smoothMouseX, [-1, 1], [50, -50]);
  const fgY = useTransform(smoothMouseY, [-1, 1], [50, -50]);

  const handleHeroClick = () => {
    if (!isMenuOpen) {
      setActiveView('menu');
    }
  };

  const handleToolSelect = (toolId: 'free-gen' | 'sketch-plus' | 'inpaint' | 'veo-video') => {
    // Navigate based on tool ID
    if (toolId === 'free-gen') {
      setActiveView('free-gen');
    } else {
      console.log(`Tool ${toolId} is under construction.`);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleHeroClick}
      className={`relative w-full h-screen overflow-hidden flex items-start justify-center bg-[#050505] perspective-1000 transition-cursor duration-300 ${isBlurActive ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <AnimatePresence mode="wait">
        {activeView === 'menu' && (
          <ToolsMenu
            key="tools-menu"
            onSelectTool={handleToolSelect}
            onClose={() => setActiveView(null)}
          />
        )}
        {activeView === 'free-gen' && (
          <motion.div
            key="free-gen"
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "circOut" }}
          >
            <FreeGeneration onBack={() => setActiveView('menu')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SCENE CONTAINER (Effects applied here) --- */}
      <motion.div
        className="relative w-full h-full pt-30 md:pt-60 flex items-start justify-center pointer-events-none"
        animate={{
          scale: isBlurActive ? 0.92 : 1,
          filter: isBlurActive ? "blur(20px) brightness(0.2) grayscale(0.8)" : "blur(0px) brightness(1) grayscale(0)",
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* --- LAYER 0: BACKGROUND --- */}
        <motion.div
          style={{ x: bgX, y: bgY, scale: 1.1 }}
          className="absolute inset-0 z-0"
        >
          <img
            src={BG_IMAGE_URL}
            alt="Noir Background"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Dark Overlay to highlight text */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </motion.div>

        {/* --- LAYER 0.5: ATMOSPHERIC VOLUMETRIC GOD RAY --- */}
        <motion.div
          className="absolute top-[-30%] right-[-10%] w-[60vw] h-[160vh] pointer-events-none origin-top-right"
          style={{ zIndex: 5, rotate: -35 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1], // Breathing scale
            x: [0, -20, 0], // Drifting towards bottom-left
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* The Light Beam Gradient */}
          <div className="w-full h-full bg-gradient-to-b from-white/30 via-white/5 to-transparent blur-[100px] mix-blend-overlay" />
        </motion.div>

        {/* --- LAYER 1: TYPOGRAPHY (MIDDLE) --- */}
        <motion.div
          style={{ x: textX, y: textY, rotateX: textRotateX, rotateY: textRotateY }}
          className="relative z-20 flex flex-col items-center justify-center pointer-events-none"
        >
          <h1
            className="font-['Oswald'] text-[24vw] font-bold leading-[0.75] tracking-tighter select-none whitespace-nowrap 
                      text-transparent bg-clip-text bg-[linear-gradient(225deg,_#ffffff_0%,_#e0e0e0_25%,_#707070_50%,_#404040_75%,_#202020_100%)]
                      transform scale-y-[1.5]
                      drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] mix-blend-normal opacity-80"
          >
            <HyperText
              text="BENLAB"
              className="font-['Oswald']"
              duration={1200}
              startOnView={false}
              animateOnHover={false}
            />
          </h1>
          <div className="flex gap-4 mt-20 md:mt-32">
            <span className="font-['Oswald'] text-sm md:text-base tracking-[0.8em] text-white/50 uppercase font-bold transform scale-y-110">
              <HyperText text={t('hero.subtitle')} duration={2000} delay={500} />
            </span>
          </div>
        </motion.div>

        {/* --- LAYER 1.5: DEPTH FOG --- */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 w-full h-1/2 z-[15] pointer-events-none"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 0.9, 0.7] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full bg-gradient-to-t from-black via-black/50 to-transparent" />
        </motion.div>

        {/* --- LAYER 2: FOREGROUND (TOP) --- */}
        <motion.div
          style={{ x: fgX, y: fgY, scale: 1.15 }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <img
            src={FG_IMAGE_URL}
            alt="Noir Foreground"
            className="w-full h-full object-cover brightness-110 contrast-70 saturate-0 drop-shadow-[0_0_5px_rgba(255,255,255,0.0)]"
          />
          {/* Vignette Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.4)_100%)]" />
        </motion.div>

        {/* --- NOISE FILTER --- */}
        <div className="absolute inset-0 z-[50] opacity-[0.03] pointer-events-none mix-blend-overlay">
          <svg className='w-full h-full'>
            <filter id='noiseFilter'>
              <feTurbulence
                type='fractalNoise'
                baseFrequency='0.8'
                stitchTiles='stitch' />
            </filter>
            <rect width='100%' height='100%' filter='url(#noiseFilter)' />
          </svg>
        </div>
      </motion.div>

      {/* --- CINEMATIC UI OVERLAY (NEW FRAME) --- */}
      <motion.div
        className="absolute inset-0 z-[60] pointer-events-none p-6 md:p-12 flex flex-col justify-between"
        animate={{ opacity: isBlurActive ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top Header Row */}
        <div className="flex justify-between items-start">
          {/* Top Left: Brand Identity */}
          <div className="pointer-events-auto group cursor-pointer flex items-center gap-4">
            <div className="relative flex items-center justify-center w-4 h-4">
              <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-red-500/50 transition-colors duration-500" />
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Oswald'] text-sm tracking-[0.2em] font-bold text-white uppercase opacity-70 group-hover:opacity-100 transition-opacity">BenLab_Studio</span>
            </div>
          </div>

          {/* Top Right: Settings Button REMOVED FROM HERE (Moved to App.tsx) */}
          <div className="w-12" /> {/* Spacer to balance layout if needed */}
        </div>

        {/* Bottom Footer Row */}
        <div className="flex justify-between items-end">
          {/* Bottom Left: System Data */}
          <div className="pointer-events-auto flex flex-col gap-1 text-[10px] font-mono text-white/30 tracking-wider mix-blend-plus-lighter">
            <span className="hover:text-white/60 transition-colors duration-300 cursor-default">{t('hero.coords')}</span>
            <span className="hover:text-white/60 transition-colors duration-300 cursor-default">EST: 2024 // V.2.0.1</span>
          </div>

          {/* Bottom Right: Nav Hint */}
          <div className="pointer-events-auto text-right group">
            <div className="font-['Oswald'] text-xs tracking-widest text-white/70 group-hover:text-white transition-colors uppercase">Da Nang</div>
            <div className="flex items-center justify-end gap-3 mt-1">
              <span className="text-[9px] text-white/30 tracking-[0.2em] uppercase group-hover:text-red-500 transition-colors duration-300">{t('hero.clickInit')}</span>
              <div className="w-6 h-[1px] bg-white/20 group-hover:w-12 group-hover:bg-red-500/50 transition-all duration-500" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;