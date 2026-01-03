import React from 'react';
import { cn } from '../../lib/utils';

interface NeonBadgeProps {
  children: React.ReactNode;
  className?: string;
  color?: 'pink' | 'cyan' | 'green';
}

const NeonBadge: React.FC<NeonBadgeProps> = ({ children, className, color = 'pink' }) => {
  const colorStyles = {
    pink: "border-pink-500 text-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3),inset_0_0_5px_rgba(236,72,153,0.1)]",
    cyan: "border-cyan-500 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3),inset_0_0_5px_rgba(6,182,212,0.1)]",
    green: "border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3),inset_0_0_5px_rgba(16,185,129,0.1)]",
  };

  return (
    <div className={cn(
      "px-3 py-1 border rounded-sm font-['Orbitron'] text-xs font-bold tracking-widest uppercase animate-flicker backdrop-blur-sm bg-black/20",
      colorStyles[color],
      className
    )}>
      {children}
    </div>
  );
};

export default NeonBadge;