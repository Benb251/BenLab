import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Terminal, Clock, Fingerprint, ScanLine } from 'lucide-react';
import { GenerationResult } from '../../types/generation';
import { AI_MODELS } from '../../constants';

interface ImageZoomModalProps {
  image: GenerationResult;
  onClose: () => void;
  onDownload: () => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ 
  image, 
  onClose, 
  onDownload 
}) => {

  const modelName = AI_MODELS.find(m => m.id === image.modelId)?.name || image.modelId;

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center font-sans perspective-1000">
      
      {/* 1. Backdrop - Fades in/out independently */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      >
         {/* Noise Overlay */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
      </motion.div>

      {/* 2. Content Wrapper */}
      <div className="relative w-full h-full max-w-[1800px] flex flex-col md:flex-row pointer-events-none p-4 md:p-8 gap-6 z-10">
        
        {/* --- LEFT: IMAGE VIEWPORT (Shared Layout) --- */}
        {/* 
            CRITICAL: The motion.img MUST have the layoutId. 
            Do NOT wrap it in a div that fades out/scales down on exit, 
            or the shared element transition will be broken or clipped.
        */}
        <div className="flex-1 flex items-center justify-center relative min-h-0">
             <motion.img
                layoutId={`image-${image.id}`}
                src={image.url}
                alt="Inspection"
                className="relative z-50 max-w-full max-h-[85vh] object-contain rounded-sm shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 bg-black cursor-zoom-out pointer-events-auto"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={onClose}
             />
             
             {/* Mobile Close Button */}
             <motion.button 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={onClose}
               className="md:hidden absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full backdrop-blur-md border border-white/10 z-[60] pointer-events-auto"
             >
               <X className="w-5 h-5" />
             </motion.button>
        </div>

        {/* --- RIGHT: INSPECTOR SIDEBAR (Slide In) --- */}
        <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: "circOut" }}
            className="w-full md:w-[420px] bg-zinc-900 border border-zinc-800 flex flex-col shadow-2xl z-20 pointer-events-auto rounded-sm overflow-hidden shrink-0"
        >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-950">
               <div>
                  <h2 className="font-['Oswald'] text-xl text-orange-500 font-bold uppercase tracking-widest flex items-center gap-2">
                     <ScanLine className="w-5 h-5" /> Visual_Analysis
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-[1px]">
                        ID: {image.id.substring(0, 12).toUpperCase()}
                     </span>
                     <span className="text-[9px] font-mono bg-orange-950/20 text-orange-500 border border-orange-500/20 px-1.5 py-0.5 rounded-[1px]">
                        INSPECTOR ACTIVE
                     </span>
                  </div>
               </div>
               <button 
                  onClick={onClose} 
                  className="hidden md:block p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors rounded-sm"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>

            {/* Scrollable Data */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
               
               {/* Prompt Block */}
               <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                     <Terminal className="w-3 h-3 text-zinc-400" /> Command Sequence
                  </label>
                  <div className="p-4 bg-black border border-zinc-800 text-zinc-300 font-mono text-xs leading-relaxed rounded-[1px] shadow-inner select-text max-h-[200px] overflow-y-auto">
                     {image.prompt || "No prompt data available."}
                  </div>
               </div>

               {/* Meta Grid */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-[1px] space-y-1">
                     <span className="text-[9px] uppercase text-zinc-600 font-bold block">Engine Core</span>
                     <span className="font-['Oswald'] text-sm text-white tracking-wide uppercase truncate" title={modelName}>
                        {modelName}
                     </span>
                  </div>
                  <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-[1px] space-y-1">
                     <span className="text-[9px] uppercase text-zinc-600 font-bold block">Aspect Ratio</span>
                     <span className="font-mono text-sm text-orange-500 block">
                        {image.aspectRatio}
                     </span>
                  </div>
                  <div className="col-span-2 p-3 bg-zinc-950/50 border border-zinc-800 rounded-[1px] space-y-1">
                     <span className="text-[9px] uppercase text-zinc-600 font-bold block flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Timestamp
                     </span>
                     <span className="font-mono text-xs text-zinc-400 block">
                        {new Date(image.timestamp).toLocaleString()}
                     </span>
                  </div>
                   <div className="col-span-2 p-3 bg-zinc-950/50 border border-zinc-800 rounded-[1px] space-y-1">
                     <span className="text-[9px] uppercase text-zinc-600 font-bold block flex items-center gap-1">
                        <Fingerprint className="w-3 h-3" /> Seed
                     </span>
                     <span className="font-mono text-xs text-zinc-500 block">
                        {image.seed || 'N/A'}
                     </span>
                  </div>
               </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950 space-y-3">
               <button 
                  onClick={onDownload}
                  className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-['Oswald'] font-bold uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-2 rounded-[1px] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
               >
                  <Download className="w-4 h-4" />
                  Save to Local
               </button>
            </div>

        </motion.div>
      </div>

    </div>
  );
};

export default ImageZoomModal;