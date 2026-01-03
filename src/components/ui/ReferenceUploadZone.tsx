
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Layers, LayoutGrid, Trash2, Plus, Loader2, CheckCircle, AlertCircle, Edit3, Database, Folder, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fileToBase64 } from '../../lib/fileUtils';
import { AnalyzedFile, GenerationResult } from '../../types/generation';
import TagEditorModal from './TagEditorModal';
import { saveImage } from '../../lib/db';

export type RefCategory = 'subject' | 'style' | 'scene';

interface ReferenceUploadZoneProps {
  files: Record<RefCategory, AnalyzedFile[]>;
  activeCategory: RefCategory;
  onCategoryChange: (category: RefCategory) => void;
  onFilesChange: (category: RefCategory, files: File[]) => void;
  onClearCategory: (category: RefCategory) => void;
  onRemoveFile: (category: RefCategory, id: string) => void;
  onUpdateTags: (category: RefCategory, id: string, newTags: string) => void;
  onOpenLibrary: () => void;
  onUploadComplete?: () => void;
  history?: GenerationResult[];
}

const CATEGORIES: { id: RefCategory; label: string; icon: any }[] = [
  { id: 'subject', label: 'Chủ Thể', icon: ImageIcon },
  { id: 'style', label: 'Phong Cách', icon: Layers },
  { id: 'scene', label: 'Bối Cảnh', icon: LayoutGrid },
];

const ReferenceUploadZone: React.FC<ReferenceUploadZoneProps> = ({ 
  files, 
  activeCategory,
  onCategoryChange,
  onFilesChange, 
  onClearCategory, 
  onRemoveFile, 
  onUpdateTags,
  onOpenLibrary,
  onUploadComplete,
  history = []
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [inspectingImage, setInspectingImage] = useState<AnalyzedFile | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // --- Handlers ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Explicitly cast to File[] because Array.from might infer unknown[]
    const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter((file) => 
      file.type.startsWith('image/')
    );
    
    if (droppedFiles.length > 0) {
      setSaveStatus('saving');
      
      // Auto-Archive Logic
      for (const file of droppedFiles) {
          let tempUrl: string | null = null;
          try {
              const base64 = await fileToBase64(file);
              tempUrl = URL.createObjectURL(file);
              const record: GenerationResult = {
                  id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                  url: tempUrl,
                  base64: base64.split(',')[1],
                  prompt: 'User Uploaded Asset',
                  modelId: 'upload',
                  aspectRatio: 'auto',
                  timestamp: Date.now(),
                  source: 'upload',
                  uploadType: activeCategory.toUpperCase() as any
              };
              await saveImage(record);
              // Revoke the temporary URL after saving - the base64 is stored in DB
              URL.revokeObjectURL(tempUrl);
          } catch (err) {
              console.error("Failed to archive upload:", err);
              // Clean up on error as well
              if (tempUrl) URL.revokeObjectURL(tempUrl);
          }
      }
      
      // UX Feedback
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);

      onFilesChange(activeCategory, droppedFiles);
      
      // Notify parent to refresh DB state
      onUploadComplete?.();
    }
  }, [activeCategory, onFilesChange, onUploadComplete]);

  const currentFiles = files[activeCategory];
  const currentCategoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || 'Reference';

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Category Tabs (Slate) */}
      <div className="flex gap-1">
        <div className="flex-1 flex p-1 bg-zinc-950 border border-zinc-800 rounded-[1px]">
            {CATEGORIES.map((cat) => (
            <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] uppercase font-bold tracking-wider transition-all duration-200 rounded-[1px]",
                activeCategory === cat.id
                    ? "bg-zinc-800 text-orange-500 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                )}
            >
                <cat.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{cat.label}</span>
            </button>
            ))}
        </div>
        
        {/* Helper Library Button Inside Zone */}
        <button
            onClick={onOpenLibrary}
            className="px-3 bg-zinc-900 border border-zinc-800 hover:border-orange-500 hover:text-orange-500 text-zinc-400 transition-colors rounded-[1px]"
            title="Open Asset Vault"
        >
            <Folder className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Drop Zone / Vault Trigger */}
      <div
        onClick={onOpenLibrary}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative min-h-[160px] border rounded-[1px] transition-all duration-300 flex flex-col items-center justify-center p-4 overflow-hidden group cursor-pointer",
          isDragging 
            ? "border-orange-500 bg-orange-600/5 shadow-[0_0_20px_rgba(234,88,12,0.1)]" 
            : "border-zinc-800 hover:border-zinc-600 bg-zinc-950 hover:bg-zinc-900"
        )}
      >
        
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
            style={{ 
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
            }}
        />

        {/* Save Status Indicator */}
        <AnimatePresence>
            {saveStatus === 'saved' && (
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="absolute top-2 right-2 z-50 flex items-center gap-1 bg-green-500/10 border border-green-500/50 px-2 py-1 rounded-[1px]"
                >
                    <Save className="w-3 h-3 text-green-500" />
                    <span className="text-[8px] font-mono font-bold text-green-500 uppercase">Vault Secured</span>
                </motion.div>
            )}
        </AnimatePresence>

        {currentFiles.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center gap-3 text-zinc-600 group-hover:text-zinc-400 transition-colors pointer-events-none">
            <div className="p-4 border border-zinc-800 bg-zinc-900 group-hover:border-zinc-600 transition-all rounded-[1px] shadow-lg">
                <Database className="w-6 h-6 text-orange-500/50 group-hover:text-orange-500 transition-colors" />
            </div>
            <div className="text-center space-y-1">
                <p className="font-['Oswald'] text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200">Open Asset Vault</p>
                <p className="font-mono text-[9px] opacity-60">DROP FILE // BROWSE LIBRARY</p>
            </div>
          </div>
        ) : (
          // Thumbnails
          <motion.div 
            layout 
            className="w-full grid grid-cols-3 gap-2 relative z-10 p-2"
          >
            <AnimatePresence mode='popLayout'>
                {currentFiles.map((item) => (
                <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative aspect-square group/item border border-zinc-800 bg-zinc-900 cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingImage(item);
                    }}
                >
                    <img 
                        src={item.preview} 
                        alt="preview" 
                        className={cn(
                            "w-full h-full object-cover transition-all duration-300",
                            item.analysisStatus === 'loading' ? "grayscale blur-[2px]" : "grayscale-0"
                        )}
                    />
                    
                    {/* Status Icons */}
                    <div className="absolute top-1 left-1 z-20">
                        {item.analysisStatus === 'loading' && (
                             <div className="p-1 bg-zinc-900/80 backdrop-blur-sm rounded-full">
                                <Loader2 className="w-3 h-3 text-white animate-spin" />
                             </div>
                        )}
                        {item.analysisStatus === 'done' && (
                             <div className="p-1 bg-zinc-900/80 backdrop-blur-sm border border-green-500/50">
                                <CheckCircle className="w-3 h-3 text-green-400" />
                             </div>
                        )}
                         {item.analysisStatus === 'error' && (
                             <div className="p-1 bg-zinc-900/80 backdrop-blur-sm border border-red-500/50">
                                <AlertCircle className="w-3 h-3 text-red-400" />
                             </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="absolute inset-0 bg-zinc-950/80 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 cursor-pointer">
                        <button
                           onClick={(e) => {
                             e.stopPropagation();
                             setInspectingImage(item);
                           }}
                           className="p-1.5 bg-zinc-200 text-black hover:scale-110 transition-transform rounded-[1px]"
                           title="Inspect Tags"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFile(activeCategory, item.id);
                          }}
                          className="p-1.5 bg-black border border-zinc-700 text-zinc-300 hover:bg-red-900 hover:border-red-500 hover:text-white transition-colors rounded-[1px]"
                          title="Remove from Selection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </motion.div>
                ))}
                
                {/* Add More Button (Opens Library) */}
                <motion.div 
                    layout
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="aspect-square border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all bg-transparent cursor-pointer rounded-[1px]"
                    onClick={(e) => { e.stopPropagation(); onOpenLibrary(); }}
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-[8px] font-mono mt-1 uppercase">Add</span>
                </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 3. Footer */}
      <div className="flex justify-between items-center px-1 border-b border-zinc-800 pb-2">
         <div className="flex items-center gap-3">
             <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                // BUFFER: {currentFiles.length}
             </span>
             
             <AnimatePresence>
                {currentFiles.length > 0 && (
                    <motion.button 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClearCategory(activeCategory);
                        }}
                        className="flex items-center gap-1.5 px-2 py-0.5 border border-zinc-800 bg-zinc-950 hover:bg-red-950/30 hover:border-red-500/30 hover:text-red-400 text-[8px] font-mono uppercase tracking-wider text-zinc-500 transition-all group rounded-[1px]"
                    >
                        <Trash2 className="w-2.5 h-2.5 group-hover:text-red-500 transition-colors" />
                        <span>CLEAR ALL</span>
                    </motion.button>
                )}
             </AnimatePresence>
         </div>

         <div className="flex gap-1.5">
             <div className={cn("w-1.5 h-1.5 transition-colors", files.subject.length > 0 ? "bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]" : "bg-zinc-800")} title="Chủ Thể" />
             <div className={cn("w-1.5 h-1.5 transition-colors", files.style.length > 0 ? "bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]" : "bg-zinc-800")} title="Phong Cách" />
             <div className={cn("w-1.5 h-1.5 transition-colors", files.scene.length > 0 ? "bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]" : "bg-zinc-800")} title="Bối Cảnh" />
         </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {inspectingImage && (
          <TagEditorModal 
            key="inspector"
            image={inspectingImage}
            categoryLabel={currentCategoryLabel}
            onClose={() => setInspectingImage(null)}
            onSave={(id, newTags) => onUpdateTags(activeCategory, id, newTags)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReferenceUploadZone;
