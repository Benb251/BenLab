import React, { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  ImageZoomModal,
  HistorySidebar,
  ImageLibraryModal
} from '@/components/ui';
import {
  GenerationControlPanel,
  PromptInputSection,
  ExecuteButton,
  ImageResultsGallery
} from '@/features/generation';
import { useGenerationStore } from '@/store/generationStore';
import { fileToBase64 } from '@/lib/fileUtils';
import { analyzeReferenceImage } from '@/services/aiAnalysisService';
import { RefCategory } from '@/components/ui/ReferenceUploadZone';
import { AnalyzedFile, GenerationResult } from '@/types/generation';
import { useHistory } from '@/hooks/useHistory';

interface FreeGenerationProps {
  onBack: () => void;
}

const FreeGeneration: React.FC<FreeGenerationProps> = ({ onBack }) => {
  // History hook - handles all IndexedDB operations and history state
  const {
    history,
    isHistoryOpen,
    refreshHistory,
    handleDelete: handleDeleteHistoryItem,
    handleClearAll: handleClearAllHistory,
    openHistory,
    closeHistory
  } = useHistory();

  // Zustand store - only what the container needs for modals/selection
  const {
    selectedImage,
    setSelectedImage,
    isLibraryOpen,
    setIsLibraryOpen,
    activeRefCategory,
    setActiveRefCategory,
    addRefFiles,
    updateRefFile
  } = useGenerationStore();

  // --- HELPERS ---
  const downloadFile = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed", e);
      window.open(url, '_blank');
    }
  }, []);

  // Helper for adding files from library
  const handleFilesAdded = useCallback(async (category: RefCategory, newFiles: File[]) => {
    // Create initial entries with loading status
    const newEntries: AnalyzedFile[] = newFiles.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      return {
        id,
        file,
        preview,
        analysisStatus: 'loading' as const
      };
    });

    // Add entries to state with loading status
    addRefFiles(category, newEntries);

    // Process all files in parallel using Promise.allSettled
    const analysisResults = await Promise.allSettled(
      newEntries.map(async (entry) => {
        const base64 = await fileToBase64(entry.file);
        const tags = await analyzeReferenceImage(base64, category.toUpperCase() as any, entry.file.type);
        return { id: entry.id, tags };
      })
    );

    // Update each file with analysis results
    analysisResults.forEach((result, index) => {
      const entryId = newEntries[index].id;
      if (result.status === 'fulfilled') {
        updateRefFile(category, entryId, {
          analysisStatus: 'done',
          analysisResult: result.value.tags
        });
      } else {
        console.error(`Analysis failed for ${newEntries[index].file.name}`, result.reason);
        updateRefFile(category, entryId, { analysisStatus: 'error' });
      }
    });
  }, [addRefFiles, updateRefFile]);

  // --- HANDLERS ---

  // Legacy bulk confirm
  const handleLibraryConfirm = useCallback((files: File[]) => {
    handleFilesAdded(activeRefCategory, files);
    setIsLibraryOpen(false);
  }, [handleFilesAdded, activeRefCategory, setIsLibraryOpen]);

  // New precise apply from Inspector
  const handleLibraryApply = useCallback((file: File, category: 'subject' | 'style' | 'scene') => {
    setActiveRefCategory(category);
    handleFilesAdded(category, [file]);
    setIsLibraryOpen(false);
  }, [setActiveRefCategory, handleFilesAdded, setIsLibraryOpen]);

  // Memoize callbacks passed to child components to prevent unnecessary re-renders
  const handleOpenLibrary = useCallback(() => {
    setIsLibraryOpen(true);
  }, [setIsLibraryOpen]);

  const handleCloseLibrary = useCallback(() => {
    setIsLibraryOpen(false);
  }, [setIsLibraryOpen]);

  const handleCloseSelectedImage = useCallback(() => {
    setSelectedImage(null);
  }, [setSelectedImage]);

  const handleDownloadSelectedImage = useCallback(() => {
    if (selectedImage) {
      downloadFile(selectedImage.url, `benlab_${selectedImage.id}.png`);
    }
  }, [selectedImage, downloadFile]);

  const handleHistorySelect = useCallback((img: GenerationResult) => {
    setSelectedImage(img);
    // Optionally close sidebar on mobile
    if (window.innerWidth < 768) closeHistory();
  }, [setSelectedImage, closeHistory]);

  return (
    <div className="w-full h-screen bg-zinc-950 flex flex-col md:flex-row overflow-hidden font-sans text-zinc-200 relative">
      {/* --- GLOBAL MODAL LAYER --- */}
      <AnimatePresence>
        {selectedImage && (
          <ImageZoomModal
            image={selectedImage}
            onClose={handleCloseSelectedImage}
            onDownload={handleDownloadSelectedImage}
          />
        )}
        {isLibraryOpen && (
          <ImageLibraryModal
            isOpen={isLibraryOpen}
            onClose={handleCloseLibrary}
            onConfirm={handleLibraryConfirm}
            onApply={handleLibraryApply}
            onDatabaseUpdate={refreshHistory}
            existingHistory={history}
          />
        )}
      </AnimatePresence>

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={closeHistory}
        history={history}
        onSelect={handleHistorySelect}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      {/* --- LEFT: CONTROL PANEL (Slate Theme) --- */}
      <div className="w-full md:w-[480px] h-full flex flex-col border-r border-white/5 bg-zinc-900/90 backdrop-blur-xl z-30 flex-shrink-0 relative shadow-[10px_0_40px_rgba(0,0,0,0.3)]">

        {/* Scrollable Form Area */}
        <GenerationControlPanel
          onBack={onBack}
          onOpenHistory={openHistory}
          onOpenLibrary={handleOpenLibrary}
          onRefreshHistory={refreshHistory}
        >
          {/* Prompt Input (inside scrollable area) */}
          <PromptInputSection />
        </GenerationControlPanel>

        {/* Footer Actions (absolute positioned) */}
        <ExecuteButton onRefreshHistory={refreshHistory} />

      </div>

      {/* --- RIGHT: VISUAL OUTPUT (Deep Slate Void) --- */}
      <ImageResultsGallery />

    </div>
  );
};

export default FreeGeneration;
