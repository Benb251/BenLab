import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Zap, PenTool, Eraser, Film, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation } from '@/lib/translations';

type ToolId = 'free-gen' | 'sketch-plus' | 'inpaint' | 'veo-video';

interface ToolsMenuProps {
  onClose: () => void;
  onSelectTool: (toolId: ToolId) => void;
}

// --- COLOR CONFIGURATION ---
const THEME_CONFIG: Record<string, {
  border: string;
  bgHover: string;
  textTitle: string;
  iconShadow: string;
  bigNumber: string;
  iconBox: string;
  accentLine: string;
}> = {
  'free-gen': {
    border: 'group-hover:border-orange-500/50',
    bgHover: 'group-hover:bg-orange-950/20',
    textTitle: 'group-hover:text-orange-500',
    iconShadow: 'group-hover:drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]',
    bigNumber: 'group-hover:text-orange-900/20',
    iconBox: 'group-hover:bg-orange-500/10 group-hover:border-orange-500/30 group-hover:text-white',
    accentLine: 'group-hover:bg-orange-500'
  },
  'sketch-plus': {
    border: 'group-hover:border-cyan-500/50',
    bgHover: 'group-hover:bg-cyan-950/20',
    textTitle: 'group-hover:text-cyan-500',
    iconShadow: 'group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]',
    bigNumber: 'group-hover:text-cyan-900/20',
    iconBox: 'group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 group-hover:text-white',
    accentLine: 'group-hover:bg-cyan-500'
  },
  'inpaint': {
    border: 'group-hover:border-fuchsia-500/50',
    bgHover: 'group-hover:bg-fuchsia-950/20',
    textTitle: 'group-hover:text-fuchsia-500',
    iconShadow: 'group-hover:drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]',
    bigNumber: 'group-hover:text-fuchsia-900/20',
    iconBox: 'group-hover:bg-fuchsia-500/10 group-hover:border-fuchsia-500/30 group-hover:text-white',
    accentLine: 'group-hover:bg-fuchsia-500'
  },
  'veo-video': {
    border: 'group-hover:border-rose-500/50',
    bgHover: 'group-hover:bg-rose-950/20',
    textTitle: 'group-hover:text-rose-500',
    iconShadow: 'group-hover:drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]',
    bigNumber: 'group-hover:text-rose-900/20',
    iconBox: 'group-hover:bg-rose-500/10 group-hover:border-rose-500/30 group-hover:text-white',
    accentLine: 'group-hover:bg-rose-500'
  }
};

interface Tool {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: any;
  locked?: boolean;
}

interface TiltCardProps {
  tool: Tool;
  index: number;
  onClick: () => void;
}

const TiltCard: React.FC<TiltCardProps> = ({ tool, index, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseXPos = event.clientX - rect.left;
    const mouseYPos = event.clientY - rect.top;

    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  const contentX = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);
  const contentY = useTransform(mouseY, [-0.5, 0.5], [-6, 6]);

  const styles = THEME_CONFIG[tool.id];

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (tool.locked) return;
        onClick();
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[500px] md:h-[600px] cursor-pointer group perspective-1000"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: "circOut" }}
    >
      <div className={cn(
        "absolute inset-0 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 transition-all duration-500 ease-out rounded-[2px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,1)]",
        "group-hover:scale-[1.02] group-hover:shadow-2xl",
        styles.border,
        styles.bgHover,
        tool.locked && "grayscale-[0.8] opacity-90"
      )}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

        <div
          style={{ transform: "translateZ(20px)" }}
          className={cn(
            "absolute -top-10 -right-6 text-[12rem] md:text-[14rem] font-['Oswald'] font-bold leading-none text-zinc-900 transition-colors duration-500 select-none pointer-events-none",
            styles.bigNumber
          )}
        >
          0{index + 1}
        </div>

        <motion.div
          style={{ x: contentX, y: contentY, transform: "translateZ(60px)" }}
          className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 z-20 pointer-events-none"
        >
          <div className={cn(
            "w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900 mb-8 transition-all duration-500 shadow-inner",
            "group-hover:scale-110",
            styles.iconBox
          )}>
            <tool.icon className={cn(
              "w-6 h-6 md:w-8 md:h-8 text-zinc-600 transition-all duration-500",
              styles.iconShadow
            )} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className={cn(
              "font-['Orbitron'] text-2xl md:text-3xl font-bold text-zinc-400 uppercase tracking-widest transition-all duration-500",
              "group-hover:tracking-[0.15em]",
              styles.textTitle
            )}>
              {tool.title}
            </h3>
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300">
               // {tool.subtitle}
            </span>
            <p className="font-['Inter'] text-sm text-zinc-500 mt-4 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
              {tool.desc}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
            <div className={cn(
              "h-[1px] w-8 bg-zinc-600 group-hover:w-16 transition-all duration-500",
              styles.accentLine
            )} />
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          </div>
        </motion.div>

        <div className={cn(
          "absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 ease-in-out bg-transparent",
          styles.accentLine
        )} />

        {/* --- LOCKED OVERLAY --- */}
        {tool.locked && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 transition-all duration-500 group-hover:backdrop-blur-none">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse rounded-full" />
              <div className="relative w-16 h-16 flex items-center justify-center border border-white/10 bg-black/40 rounded-full">
                <Lock className="w-6 h-6 text-zinc-500 group-hover:text-red-500 transition-colors duration-500" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-['Orbitron'] text-[10px] tracking-[0.3em] text-zinc-500 uppercase font-bold group-hover:text-red-500/70 transition-colors">
                Restricted Access
              </span>
              <div className="h-[1px] w-12 bg-white/5 group-hover:w-20 group-hover:bg-red-500/30 transition-all duration-700" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ToolsMenu: React.FC<ToolsMenuProps> = ({ onClose, onSelectTool }) => {
  const { language } = useSettingsStore();
  const t = useTranslation(language);

  const tools = [
    {
      id: 'free-gen',
      title: t('modules.freeGen'),
      subtitle: t('modules.freeGenDesc').replace('// ', ''),
      desc: t('modules.freeGenLong'),
      icon: Zap,
      locked: false,
    },
    {
      id: 'sketch-plus',
      title: t('modules.sketch'),
      subtitle: t('modules.sketchDesc').replace('// ', ''),
      desc: t('modules.sketchLong'),
      icon: PenTool,
      locked: true,
    },
    {
      id: 'inpaint',
      title: t('modules.inpaint'),
      subtitle: t('modules.inpaintDesc').replace('// ', ''),
      desc: t('modules.inpaintLong'),
      icon: Eraser,
      locked: true,
    },
    {
      id: 'veo-video',
      title: t('modules.video'),
      subtitle: t('modules.videoDesc').replace('// ', ''),
      desc: t('modules.videoLong'),
      icon: Film,
      locked: true,
    }
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-xl overflow-hidden cursor-pointer"
    >
      <div className="absolute top-0 left-0 right-0 p-8 md:p-12 flex justify-between items-end z-50 pointer-events-none">
        <div
          className="pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-['Orbitron'] text-xl md:text-3xl text-zinc-200 font-bold uppercase tracking-[0.2em]"
          >
            System Modules
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 100 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-[2px] bg-zinc-700 mt-4 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          />
        </div>
      </div>

      <div className="relative w-full max-w-[1800px] h-full overflow-y-auto md:overflow-hidden flex items-center justify-center p-8 md:p-20 z-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-20 md:mt-0">
          {tools.map((tool, index) => (
            <TiltCard
              key={tool.id}
              tool={tool}
              index={index}
              onClick={() => onSelectTool(tool.id as ToolId)}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
    </motion.div>
  );
};

export default ToolsMenu;