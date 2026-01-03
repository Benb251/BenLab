
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Tag, Plus, Terminal, Trash2, Check } from 'lucide-react';
import { AnalyzedFile } from '../../types/generation';
import { cn } from '../../lib/utils';

interface TagEditorModalProps {
  image: AnalyzedFile;
  categoryLabel: string;
  onClose: () => void;
  onSave: (id: string, newTags: string) => void;
}

const TagEditorModal: React.FC<TagEditorModalProps> = ({ image, categoryLabel, onClose, onSave }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Initialize tags from comma-separated string
  useEffect(() => {
    if (image.analysisResult) {
      const splitTags = image.analysisResult.split(',').map(t => t.trim()).filter(Boolean);
      setTags(splitTags);
    } else {
      setTags([]);
    }
  }, [image.analysisResult]);

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    setTags(prev => [...prev, newTagInput.trim()]);
    setNewTagInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    onSave(image.id, tags.join(', '));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md"
      />

      {/* Main Container - Slate Glass */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0 }}
        className="relative w-full max-w-4xl h-[600px] bg-zinc-950 border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden rounded-[1px]"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-[1px] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Preview */}
        <div className="w-full md:w-[40%] bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex items-center justify-center p-8 relative overflow-hidden">
           {/* Grid Background */}
           <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
           />
           
           <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="relative w-full h-full min-h-[200px] border border-zinc-800 bg-zinc-950 p-2 shadow-inner">
                <img 
                  src={image.preview} 
                  alt="Inspection" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest flex flex-col items-center gap-1">
                 <span>Ref_ID: {image.id.toUpperCase()}</span>
                 <span className="text-orange-500">{categoryLabel}</span>
              </div>
           </div>
        </div>

        {/* Right Column: Editor */}
        <div className="w-full md:w-[60%] flex flex-col p-8 md:p-10 relative bg-zinc-950">
          
          {/* Header */}
          <div className="mb-6 space-y-2">
            <h2 className="font-['Oswald'] text-2xl text-zinc-200 font-bold tracking-widest uppercase flex items-center gap-3">
              <Terminal className="w-5 h-5 text-orange-500" />
              Inspector // Tag Editor
            </h2>
            <div className="h-[1px] w-full bg-gradient-to-r from-zinc-800 via-zinc-800 to-transparent" />
            <p className="font-mono text-[10px] text-zinc-500 pt-1">
              Verify and correct AI-generated analysis data.
            </p>
          </div>

          {/* Tags Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
             <div className="flex flex-wrap gap-2 content-start">
               <AnimatePresence>
                 {tags.map((tag, index) => (
                   <motion.div
                     key={`${tag}-${index}`}
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.5 }}
                     layout
                     className="group flex items-center gap-2 pl-3 pr-1 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 text-xs font-mono rounded-full transition-all"
                   >
                     <span className="select-none">{tag}</span>
                     <button
                       onClick={() => handleRemoveTag(index)}
                       className="p-1 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-full transition-colors"
                     >
                       <X className="w-3 h-3" />
                     </button>
                   </motion.div>
                 ))}
               </AnimatePresence>
               
               {tags.length === 0 && (
                 <div className="w-full h-24 flex items-center justify-center border border-dashed border-zinc-800 text-zinc-600 text-xs font-mono uppercase">
                    No data detected
                 </div>
               )}
             </div>
          </div>

          {/* Input Area */}
          <div className="mt-auto space-y-4">
             <div className="relative group">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                 <Plus className="w-4 h-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
               </div>
               <input 
                 type="text"
                 value={newTagInput}
                 onChange={(e) => setNewTagInput(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Add new keyword data..."
                 className="w-full bg-zinc-900 border border-zinc-800 p-3 pl-10 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-900 transition-all rounded-[1px]"
               />
               <div className="absolute inset-y-0 right-3 flex items-center">
                 <span className="text-[9px] font-mono text-zinc-700 uppercase">Press Enter</span>
               </div>
             </div>

             <button
               onClick={handleSave}
               className="w-full py-4 bg-zinc-200 text-black font-['Oswald'] font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-colors shadow-lg flex items-center justify-center gap-2 rounded-[1px]"
             >
               <Check className="w-4 h-4" />
               Confirm Data Update
             </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default TagEditorModal;
