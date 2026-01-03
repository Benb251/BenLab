
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { X, Trash2, Eye, Clock, Database, Image as ImageIcon } from 'lucide-react';
import { GenerationResult } from '../../types/generation';
import { AI_MODELS } from '../../constants';

const ITEM_HEIGHT = 108; // Fixed height for each history item (96px content + 12px gap)

interface HistorySidebarProps {
  isOpen: boolean;
  history: GenerationResult[];
  onClose: () => void;
  onSelect: (image: GenerationResult) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  history,
  onClose,
  onSelect,
  onDelete,
  onClearAll
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: history.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5, // Render 5 extra items above/below viewport for smoother scrolling
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm md:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-[200] h-full w-[320px] md:w-[400px] bg-zinc-950 border-l border-zinc-800 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
            />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md relative z-10">
               <div>
                  <h2 className="font-['Oswald'] text-xl text-zinc-200 uppercase tracking-widest flex items-center gap-2">
                     <Database className="w-5 h-5 text-orange-500" />
                     Archive Vault
                  </h2>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-1">
                     {history.length} Records Found
                  </p>
               </div>
               <button 
                  onClick={onClose} 
                  className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors rounded-[1px]"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* List Content */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10"
            >
               {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-700 space-y-4">
                      <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center rounded-[1px]">
                          <Database className="w-8 h-8 opacity-20" />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest">No Archival Data</span>
                  </div>
               ) : (
                 <div
                   style={{
                     height: `${virtualizer.getTotalSize()}px`,
                     width: '100%',
                     position: 'relative',
                   }}
                 >
                   {virtualizer.getVirtualItems().map((virtualRow) => {
                     const item = history[virtualRow.index];
                     const modelName = AI_MODELS.find(m => m.id === item.modelId)?.badge || item.modelId.substring(0, 4);
                     return (
                       <div
                         key={item.id}
                         style={{
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           width: '100%',
                           height: `${virtualRow.size}px`,
                           transform: `translateY(${virtualRow.start}px)`,
                         }}
                         className="pb-3"
                       >
                         <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ duration: 0.15 }}
                           className="group relative flex h-24 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-all rounded-[1px]"
                         >
                           {/* Thumbnail */}
                           <div className="w-24 h-24 flex-shrink-0 bg-black relative border-r border-zinc-800">
                             <img
                               src={item.url}
                               alt="thumb"
                               className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                               loading="lazy"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                           </div>

                           {/* Info */}
                           <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                             <div className="space-y-1">
                               <div className="flex items-center justify-between">
                                 <span className="text-[9px] font-bold font-mono text-orange-500 uppercase px-1.5 py-0.5 bg-orange-950/30 border border-orange-900/50 rounded-[1px]">
                                   {modelName}
                                 </span>
                                 <span className="text-[9px] font-mono text-zinc-600">
                                   {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                               </div>
                               <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                                 {item.prompt}
                               </p>
                             </div>

                             {/* Actions */}
                             <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/50 mt-1">
                               <button
                                 onClick={() => onDelete(item.id)}
                                 className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-zinc-800 transition-colors rounded-[1px]"
                                 title="Purge Record"
                               >
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                               <button
                                 onClick={() => onSelect(item)}
                                 className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 text-[10px] font-bold uppercase tracking-wider transition-colors rounded-[1px]"
                               >
                                 <Eye className="w-3 h-3" />
                                 Inspect
                               </button>
                             </div>
                           </div>
                         </motion.div>
                       </div>
                     );
                   })}
                 </div>
               )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 relative z-10">
               <button 
                  onClick={onClearAll}
                  disabled={history.length === 0}
                  className="w-full py-3 border border-zinc-700 text-zinc-500 hover:text-red-500 hover:border-red-500/50 hover:bg-red-950/10 font-mono text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-[1px]"
               >
                  <Trash2 className="w-3 h-3" />
                  Format Storage Drive
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;
