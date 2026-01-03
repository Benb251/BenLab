
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Image as ImageIcon, Layers, LayoutGrid, Database, Loader2, ArrowLeft, User, Palette, Mountain, FileImage, Calendar, Search, Copy, Terminal, Clipboard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fileToBase64 } from '../../lib/fileUtils';
import { GenerationResult } from '../../types/generation';
import { saveImage } from '../../lib/db';

// --- TYPES ---
export interface LibraryAsset {
  id: string;
  url: string;
  base64?: string; // Base64 image data for reliable file conversion
  type: 'upload' | 'history';
  category: 'subject' | 'style' | 'scene' | 'uncategorized';
  file?: File;
  timestamp: number;
  prompt?: string; // Added prompt field
  source?: 'generated' | 'upload';
  meta?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (files: File[]) => void;
  onApply?: (file: File, category: 'subject' | 'style' | 'scene') => void;
  onDatabaseUpdate?: () => void;
  existingHistory?: GenerationResult[];
}

// --- UTILS ---
const assetToFile = async (asset: LibraryAsset): Promise<File> => {
    if (asset.file) return asset.file;

    // If we have base64 data, use it directly (more reliable than blob URLs)
    if (asset.base64) {
        try {
            const mimeType = asset.meta?.format ? `image/${asset.meta.format}` : 'image/png';
            const byteCharacters = atob(asset.base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const ext = mimeType.split('/')[1] || 'png';
            const filename = `asset_${asset.id.substring(0, 8)}.${ext}`;
            return new File([blob], filename, { type: mimeType });
        } catch (err) {
            console.error("Base64 conversion failed", err);
            // Fall through to URL fetch as fallback
        }
    }

    // Fallback: try to fetch from URL (works for data URLs and valid blob URLs)
    try {
        const response = await fetch(asset.url);
        const blob = await response.blob();
        const type = blob.type || 'image/png';
        const ext = type.split('/')[1] || 'png';
        const filename = `asset_${asset.id.substring(0,8)}.${ext}`;
        return new File([blob], filename, { type });
    } catch (err) {
        console.error("Conversion failed", err);
        throw new Error("Failed to process asset");
    }
};

// --- SUB-COMPONENT: ASSET INSPECTOR ---
const AssetInspector: React.FC<{
    asset: LibraryAsset;
    onClose: () => void;
    onApply: (category: 'subject' | 'style' | 'scene') => void;
    isProcessing: boolean;
}> = ({ asset, onClose, onApply, isProcessing }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyPrompt = () => {
        if (asset.prompt) {
            navigator.clipboard.writeText(asset.prompt);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const isUserUpload = asset.prompt === 'User Uploaded Asset' || asset.source === 'upload';

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute inset-0 z-50 bg-zinc-950 flex flex-col md:flex-row overflow-hidden"
        >
            {/* LEFT: VIEWPORT */}
            <div className="flex-1 relative bg-[#0a0a0a] flex items-center justify-center p-4 md:p-12 overflow-hidden">
                {/* Checkered Background for Transparency */}
                <div className="absolute inset-0 opacity-[0.05]" 
                     style={{ 
                         backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                         backgroundSize: '20px 20px',
                         backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                     }} 
                />
                
                <motion.img 
                    layoutId={`asset-${asset.id}`}
                    src={asset.url}
                    className="relative z-10 w-full h-full object-contain shadow-2xl drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                />

                {/* Back Button (Mobile) */}
                <button 
                    onClick={onClose}
                    className="md:hidden absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white z-50"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>

            {/* RIGHT: CONTROL PANEL */}
            <div className="w-full md:w-[380px] bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl z-20">
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-800">
                    <button 
                        onClick={onClose}
                        className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        BACK TO GRID
                    </button>

                    <h2 className="font-['Oswald'] text-2xl text-zinc-100 uppercase tracking-widest break-all line-clamp-2">
                        {asset.file?.name || `ASSET_${asset.id.substring(0,8).toUpperCase()}`}
                    </h2>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className={cn(
                            "px-2 py-1 rounded-[2px] text-[9px] font-mono uppercase border",
                            asset.source === 'upload' 
                                ? "bg-zinc-800 text-zinc-400 border-zinc-700" 
                                : "bg-orange-950/20 text-orange-500 border-orange-500/20"
                        )}>
                            {asset.source === 'upload' ? 'LOCAL_UPLOAD' : 'AI_GENERATED'}
                        </span>
                        <span className="px-2 py-1 bg-zinc-800 rounded-[2px] text-[9px] font-mono text-zinc-400 uppercase border border-zinc-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(asset.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Info Body */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* Metadata Box */}
                    <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-[2px] space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            <FileImage className="w-3 h-3" /> File Metadata
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[9px] font-mono text-zinc-600 uppercase">Format</div>
                                <div className="text-sm font-mono text-zinc-300">
                                    {asset.file ? asset.file.type.split('/')[1].toUpperCase() : 'PNG/JPG'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[9px] font-mono text-zinc-600 uppercase">Size</div>
                                <div className="text-sm font-mono text-zinc-300">
                                    {asset.file ? `${(asset.file.size / 1024 / 1024).toFixed(2)} MB` : 'UNKNOWN'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PROMPT DATA SECTION */}
                    {asset.prompt && !isUserUpload && (
                        <div className="space-y-2">
                             <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                    <Terminal className="w-3 h-3 text-zinc-500" /> GENERATE PROMPT
                                </label>
                                <button 
                                    onClick={handleCopyPrompt}
                                    className="text-[9px] font-mono uppercase text-zinc-500 hover:text-orange-500 flex items-center gap-1 transition-colors"
                                >
                                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {isCopied ? 'COPIED' : 'COPY'}
                                </button>
                             </div>
                             <div className="max-h-32 overflow-y-auto text-xs font-mono text-zinc-300 bg-black/50 p-3 rounded-[2px] border border-white/5 custom-scrollbar leading-relaxed">
                                {asset.prompt}
                             </div>
                        </div>
                    )}
                </div>

                {/* THE ACTION DECK */}
                <div className="p-6 bg-zinc-950 border-t border-zinc-800">
                    <div className="mb-4 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                             APPLY AS / ÁP DỤNG LÀM:
                         </span>
                         {isProcessing && <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />}
                    </div>
                    
                    <div className="space-y-3">
                        {/* 1. SUBJECT */}
                        <button
                            onClick={() => onApply('subject')}
                            disabled={isProcessing}
                            className="w-full group relative overflow-hidden p-3 border border-blue-500/20 hover:border-blue-500/50 bg-blue-950/5 hover:bg-blue-500/10 rounded-[2px] transition-all duration-300"
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-['Oswald'] text-sm text-blue-100 uppercase tracking-wide">CHỦ THỂ</div>
                                        <div className="text-[9px] font-mono text-blue-400/60 uppercase">Reference Type: Subject</div>
                                    </div>
                                </div>
                                <ArrowLeft className="w-4 h-4 rotate-180 text-blue-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </div>
                        </button>

                        {/* 2. STYLE */}
                        <button
                            onClick={() => onApply('style')}
                            disabled={isProcessing}
                            className="w-full group relative overflow-hidden p-3 border border-purple-500/20 hover:border-purple-500/50 bg-purple-950/5 hover:bg-purple-500/10 rounded-[2px] transition-all duration-300"
                        >
                             <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-full text-purple-400 group-hover:scale-110 transition-transform">
                                        <Palette className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-['Oswald'] text-sm text-purple-100 uppercase tracking-wide">PHONG CÁCH</div>
                                        <div className="text-[9px] font-mono text-purple-400/60 uppercase">Reference Type: Style</div>
                                    </div>
                                </div>
                                <ArrowLeft className="w-4 h-4 rotate-180 text-purple-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </div>
                        </button>

                        {/* 3. SCENE */}
                        <button
                            onClick={() => onApply('scene')}
                            disabled={isProcessing}
                            className="w-full group relative overflow-hidden p-3 border border-orange-500/20 hover:border-orange-500/50 bg-orange-950/5 hover:bg-orange-500/10 rounded-[2px] transition-all duration-300"
                        >
                             <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/10 rounded-full text-orange-400 group-hover:scale-110 transition-transform">
                                        <Mountain className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-['Oswald'] text-sm text-orange-100 uppercase tracking-wide">BỐI CẢNH</div>
                                        <div className="text-[9px] font-mono text-orange-400/60 uppercase">Reference Type: Scene</div>
                                    </div>
                                </div>
                                <ArrowLeft className="w-4 h-4 rotate-180 text-orange-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---
const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  onApply,
  onDatabaseUpdate,
  existingHistory = []
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'subject' | 'style' | 'scene'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inspectingAsset, setInspectingAsset] = useState<LibraryAsset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track object URLs created locally for cleanup
  const localObjectURLsRef = useRef<Set<string>>(new Set());

  // Initialize assets from history
  useEffect(() => {
    const historyAssets: LibraryAsset[] = existingHistory.map(h => {
      // Use base64 data URL if available, otherwise fall back to stored URL
      // This ensures images display correctly even if blob URLs are stale
      const displayUrl = h.base64
        ? `data:image/png;base64,${h.base64}`
        : h.url;

      return {
        id: h.id,
        url: displayUrl,
        base64: h.base64, // Pass base64 for file conversion
        type: h.source === 'upload' ? 'upload' : 'history', // Correctly map from DB source
        category: 'uncategorized',
        timestamp: h.timestamp,
        prompt: h.prompt,
        source: h.source // Pass source through
      };
    });

    setAssets(historyAssets.sort((a, b) => b.timestamp - a.timestamp));
  }, [existingHistory]);

  // Cleanup object URLs when component unmounts or modal closes
  useEffect(() => {
    const urlsRef = localObjectURLsRef.current;
    return () => {
      urlsRef.forEach(url => URL.revokeObjectURL(url));
      urlsRef.clear();
    };
  }, []);

  // --- SMART PROCESSING (Handles Uploads & Pastes) ---
  const processNewFiles = useCallback(async (files: File[]) => {
      setIsProcessing(true);
      const newAssets: LibraryAsset[] = [];
      
      // Intelligent Context Awareness: Detect category from active tab
      let targetCategory: 'subject' | 'style' | 'scene' | 'uncategorized' = 'uncategorized';
      let targetUploadType: 'SUBJECT' | 'STYLE' | 'SCENE' | null = null;

      if (activeTab !== 'all') {
          targetCategory = activeTab;
          targetUploadType = activeTab.toUpperCase() as any;
      }

      try {
        for (const file of files) {
            const base64 = await fileToBase64(file);
            const objectUrl = URL.createObjectURL(file);
            // Track this URL for cleanup
            localObjectURLsRef.current.add(objectUrl);

            const asset: LibraryAsset = {
                id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                url: objectUrl,
                type: 'upload',
                category: targetCategory,
                file: file,
                timestamp: Date.now(),
                prompt: 'User Uploaded Asset',
                source: 'upload'
            };

            // AUTO-ARCHIVE to Vault
            await saveImage({
                 id: asset.id,
                 url: asset.url,
                 base64: base64.split(',')[1],
                 prompt: asset.prompt || '',
                 modelId: 'upload',
                 aspectRatio: 'auto',
                 timestamp: asset.timestamp,
                 source: 'upload',
                 uploadType: targetUploadType
            });

            newAssets.push(asset);
        }
        setAssets(prev => [...newAssets, ...prev]);
        
        // NOTIFY PARENT TO REFRESH HISTORY
        onDatabaseUpdate?.();

      } catch (err) {
          console.error("Paste/Upload failed:", err);
      } finally {
          setIsProcessing(false);
      }
  }, [activeTab, onDatabaseUpdate]);

  // --- PASTE LISTENER ---
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const pastedFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                if (file) pastedFiles.push(file);
            }
        }

        if (pastedFiles.length > 0) {
            await processNewFiles(pastedFiles);
        }
    };

    if (isOpen) {
        window.addEventListener('paste', handlePaste);
    }
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, processNewFiles]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      processNewFiles(newFiles);
    }
  };

  const handleBulkConfirm = async () => {
    setIsProcessing(true);
    try {
      const selectedAssets = assets.filter(a => selectedIds.has(a.id));
      const files: File[] = [];

      for (const asset of selectedAssets) {
          files.push(await assetToFile(asset));
      }
      onConfirm(files);
      onClose();
    } catch (e) {
      console.error("Confirmation error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInspectorApply = async (category: 'subject' | 'style' | 'scene') => {
      if (!inspectingAsset || !onApply) return;
      
      setIsProcessing(true);
      try {
          const file = await assetToFile(inspectingAsset);
          onApply(file, category);
          onClose(); // Close modal after successful application
      } catch (e) {
          console.error("Apply failed", e);
      } finally {
          setIsProcessing(false);
      }
  };

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening inspector
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const filteredAssets = assets.filter(a => {
    if (activeTab === 'all') return true;
    return a.category === activeTab; 
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl h-[85vh] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        
        {/* INSPECTOR LAYER */}
        <AnimatePresence>
            {inspectingAsset && (
                <AssetInspector 
                    asset={inspectingAsset} 
                    onClose={() => setInspectingAsset(null)}
                    onApply={handleInspectorApply}
                    isProcessing={isProcessing}
                />
            )}
        </AnimatePresence>

        {/* --- MAIN GRID VIEW --- */}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900 z-10 flex-shrink-0">
          <div>
            <h2 className="font-['Oswald'] text-xl md:text-2xl text-zinc-200 uppercase tracking-wider font-bold flex items-center gap-3">
               <Database className="w-6 h-6 text-orange-500" />
               THƯ VIỆN TÀI NGUYÊN / ASSET VAULT
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1 flex items-center gap-2">
               System Storage // Local & Cloud 
               <span className="text-orange-500 flex items-center gap-1"><Clipboard className="w-3 h-3" /> PASTE (Ctrl+V) ENABLED</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex flex-col md:flex-row gap-4 justify-between items-center flex-shrink-0">
          
          {/* Tabs */}
          <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 overflow-x-auto max-w-full">
             {(['all', 'subject', 'style', 'scene'] as const).map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={cn(
                   "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap",
                   activeTab === tab 
                     ? "bg-zinc-800 text-orange-500 shadow-sm border-b-2 border-orange-500" 
                     : "text-zinc-500 hover:text-zinc-300"
                 )}
               >
                 {tab === 'all' && 'Tất cả'}
                 {tab === 'subject' && 'Chủ thể'}
                 {tab === 'style' && 'Phong cách'}
                 {tab === 'scene' && 'Bối cảnh'}
               </button>
             ))}
          </div>

          {/* Upload Action */}
          <button 
             onClick={() => fileInputRef.current?.click()}
             className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-lg transition-all text-xs font-bold uppercase tracking-wider group flex-shrink-0"
          >
             <Upload className="w-4 h-4 group-hover:text-white transition-colors" />
             <span>Upload New</span>
          </button>
          <input 
             ref={fileInputRef}
             type="file"
             multiple
             accept="image/*"
             className="hidden"
             onChange={handleFileUpload}
          />
        </div>

        {/* The Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-zinc-950/50">
           {isProcessing && (
              <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                     <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                     <span className="text-xs font-mono uppercase tracking-widest text-white">Importing Assets...</span>
                  </div>
              </div>
           )}

           {filteredAssets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                 <div className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                 </div>
                 <div className="text-center">
                    <p className="font-mono text-xs uppercase tracking-widest mb-1">Vault Empty</p>
                    <p className="text-[9px] text-zinc-700">Ctrl+V to Paste or Upload</p>
                 </div>
              </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedIds.has(asset.id);
                  return (
                    <motion.div
                      layout
                      layoutId={`asset-${asset.id}`}
                      key={asset.id}
                      onClick={() => setInspectingAsset(asset)}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border bg-black group cursor-pointer transition-all duration-200",
                        isSelected 
                          ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] ring-1 ring-orange-500" 
                          : "border-white/5 hover:border-orange-500/50"
                      )}
                    >
                       <img 
                          src={asset.url} 
                          alt="Asset" 
                          loading="lazy"
                          className={cn(
                             "w-full h-full object-cover transition-transform duration-500",
                             "opacity-80 group-hover:opacity-100 group-hover:scale-105"
                          )}
                       />
                       
                       {/* Hover Overlay */}
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-[10px] font-mono text-white uppercase tracking-widest border border-white/20 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-[2px]">
                                Inspect
                            </span>
                       </div>

                       {/* Selection Checkbox (Top Right) */}
                       <div 
                         onClick={(e) => toggleSelection(e, asset.id)}
                         className={cn(
                            "absolute top-2 right-2 w-5 h-5 border rounded-[2px] flex items-center justify-center z-20 transition-all hover:scale-110",
                            isSelected ? "bg-orange-500 border-orange-500 text-white" : "bg-black/50 border-white/30 hover:border-white text-transparent"
                         )}
                       >
                          <Check className="w-3 h-3" />
                       </div>

                       {/* Type Badge */}
                       <div className={cn(
                           "absolute bottom-2 left-2 px-1.5 py-0.5 backdrop-blur-sm border rounded text-[9px] font-mono uppercase pointer-events-none",
                           asset.type === 'history' 
                               ? "bg-black/80 border-orange-500/30 text-orange-500"
                               : "bg-zinc-900/80 border-white/20 text-zinc-400"
                       )}>
                          {asset.type === 'history' ? 'Gen_Hist' : 'Local_Up'}
                       </div>
                    </motion.div>
                  );
                })}
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center z-10 flex-shrink-0">
           <div className="flex items-center gap-4">
              <span className="text-zinc-400 font-mono text-xs tracking-wider">
                 Đã chọn: <span className="text-orange-500 font-bold">{selectedIds.size}</span> ảnh
              </span>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                 onClick={onClose}
                 className="px-6 py-2 text-zinc-500 hover:text-white font-['Oswald'] uppercase tracking-wider text-sm transition-colors"
              >
                 Cancel
              </button>
              
              {/* Only show Confirm if manual selection exists */}
              {selectedIds.size > 0 && (
                <button 
                    onClick={handleBulkConfirm}
                    disabled={isProcessing}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all font-['Oswald'] uppercase tracking-wider text-sm border border-zinc-600",
                        isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Import Selection"}
                </button>
              )}
           </div>
        </div>

      </motion.div>
    </div>
  );
};

export default ImageLibraryModal;
