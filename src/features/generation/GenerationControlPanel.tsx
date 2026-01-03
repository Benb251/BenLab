import React, { useEffect, useRef, ReactNode, useCallback, memo } from 'react';
import {
  Maximize, ChevronLeft, Box,
  Sliders, FolderOpen, Scan, History,
  Square, Smartphone, MonitorPlay, Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fileToBase64 } from '@/lib/fileUtils';
import { AI_MODELS, ASPECT_RATIOS, MODEL_RATIO_LIMITS } from '@/constants';
import ReferenceUploadZone, { RefCategory } from '@/components/ui/ReferenceUploadZone';
import { AnalyzedFile } from '@/types/generation';
import { analyzeReferenceImage } from '@/services/aiAnalysisService';
import { fetchModelsFromProxy } from '@/services/imageGenerationService';
import { useGenerationStore } from '@/store/generationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation } from '@/lib/translations';

interface GenerationControlPanelProps {
  onBack: () => void;
  onOpenHistory: () => void;
  onOpenLibrary: () => void;
  onRefreshHistory: () => Promise<void>;
  children?: ReactNode;
}

const GenerationControlPanel: React.FC<GenerationControlPanelProps> = memo(({
  onBack,
  onOpenHistory,
  onOpenLibrary,
  onRefreshHistory,
  children
}) => {
  const { language } = useSettingsStore();
  const t = useTranslation(language);

  // Zustand store - only grab what this component needs
  const {
    selectedModel,
    setSelectedModel,
    aspectRatio,
    setAspectRatio,
    imageCount,
    setImageCount,
    activeRefCategory,
    setActiveRefCategory,
    refFiles,
    addRefFiles,
    updateRefFile,
    removeRefFile,
    clearRefCategory,
    history
  } = useGenerationStore();

  // Track object URLs for cleanup to prevent memory leaks
  const objectURLsRef = useRef<Map<string, string>>(new Map());

  const [proxyModels, setProxyModels] = React.useState<any[]>([]);

  // Logic: Fetch models from proxy
  useEffect(() => {
    const loadModels = async () => {
      const models = await fetchModelsFromProxy();
      if (models.length > 0) {
        setProxyModels(models);
        // If current selected model is not in proxy models, select the first one
        if (!models.find(m => m.id === selectedModel)) {
          setSelectedModel(models[0].id);
        }
      }
    };
    loadModels();
  }, []);

  // Use proxy models if available, fallback to hardcoded
  // Filter: Only show the image generation model as requested
  const displayModels = proxyModels.length > 0
    ? proxyModels
      .filter(m => m.id.toLowerCase() === 'gemini-3-pro-image-preview')
      .map(m => ({
        id: m.id,
        name: m.name || m.id,
        badge: 'PROXY',
        description: `Operational model from ProxyPal.`,
        apiModel: m.id,
        provider: 'PROXY' as const
      }))
    : AI_MODELS;

  // Logic: Reset Ratio if invalid for model
  useEffect(() => {
    const allowedRatios = MODEL_RATIO_LIMITS[selectedModel];
    if (allowedRatios && !allowedRatios.includes(aspectRatio)) {
      setAspectRatio(allowedRatios[0]);
    }
  }, [selectedModel, aspectRatio, setAspectRatio]);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    const urlsRef = objectURLsRef.current;
    return () => {
      urlsRef.forEach(url => URL.revokeObjectURL(url));
      urlsRef.clear();
    };
  }, []);

  const isRatioDisabled = useCallback((ratioId: string) => {
    const allowed = MODEL_RATIO_LIMITS[selectedModel];
    return allowed ? !allowed.includes(ratioId) : false;
  }, [selectedModel]);

  const handleFilesAdded = useCallback(async (category: RefCategory, newFiles: File[]) => {
    // Create initial entries with loading status
    const newEntries: AnalyzedFile[] = newFiles.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      // Track the URL for cleanup
      objectURLsRef.current.set(id, preview);
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

  const handleRemoveFile = useCallback((category: RefCategory, id: string) => {
    // Revoke the object URL to free memory
    const url = objectURLsRef.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      objectURLsRef.current.delete(id);
    }
    removeRefFile(category, id);
  }, [removeRefFile]);

  const handleClearCategory = useCallback((category: RefCategory) => {
    // Revoke all object URLs for this category
    refFiles[category].forEach(f => {
      const url = objectURLsRef.current.get(f.id);
      if (url) {
        URL.revokeObjectURL(url);
        objectURLsRef.current.delete(f.id);
      }
    });
    clearRefCategory(category);
  }, [refFiles, clearRefCategory]);

  const handleUpdateTags = useCallback((category: RefCategory, id: string, newTags: string) => {
    updateRefFile(category, id, { analysisResult: newTags });
  }, [updateRefFile]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-32">

      {/* Header */}
      <div className="space-y-4 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-orange-500 transition-colors group"
        >
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          <span>{t('gen.abort')}</span>
        </button>

        <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <h2 className="font-['Oswald'] text-2xl text-zinc-100 font-bold tracking-widest uppercase flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              {t('gen.freeGen')}
            </h2>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-4">

            <div className="font-mono text-[9px] text-zinc-600">{t('gen.sysRdy')}</div>
          </div>
        </div>
      </div>

      {/* 1. Model Selector */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-zinc-500 font-bold">
          <Box className="w-3 h-3 text-zinc-400" /> {t('gen.core')}
        </label>
        <div className="flex flex-col gap-2">
          {displayModels.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={cn(
                  "relative w-full p-4 flex items-center justify-between text-left transition-all duration-200 border group rounded-[1px]",
                  isSelected
                    ? "bg-orange-600/10 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)] z-10"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <div className="z-10 flex flex-col">
                  <span className={cn(
                    "font-['Oswald'] uppercase text-sm tracking-wide",
                    isSelected ? "font-bold" : "font-normal"
                  )}>
                    {model.name}
                  </span>
                  <span className={cn(
                    "text-[9px] font-mono mt-1",
                    isSelected ? "text-orange-500/70 font-bold" : "text-zinc-600"
                  )}>
                    {model.description}
                  </span>
                </div>
                <div className={cn(
                  "z-10 px-2 py-0.5 text-[9px] font-bold font-['Orbitron'] border uppercase tracking-wider rounded-[1px]",
                  isSelected
                    ? "border-orange-500 text-orange-500"
                    : "border-zinc-800 text-zinc-600 group-hover:border-zinc-600"
                )}>
                  {model.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Parameters */}
      <div className="space-y-6 pt-2">
        {/* Aspect Ratio */}
        <div className="space-y-3">
          <label className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-zinc-500 font-bold">
            <span className="flex items-center gap-2"><Maximize className="w-3 h-3 text-zinc-400" /> {t('gen.ratio')}</span>
            <span className="font-mono text-orange-400 bg-zinc-800 px-1.5 py-0.5 text-[10px] rounded-[1px]">
              {aspectRatio === 'auto' ? 'AUTO' : aspectRatio}
            </span>
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {ASPECT_RATIOS.map((ratio) => {
              const disabled = isRatioDisabled(ratio.id);
              const isActive = aspectRatio === ratio.id;
              return (
                <button
                  key={ratio.id}
                  disabled={disabled}
                  onClick={() => setAspectRatio(ratio.id)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center gap-1 transition-all duration-200 border rounded-[1px]",
                    isActive
                      ? "bg-zinc-800 border-orange-500/50 text-orange-500 shadow-sm"
                      : disabled
                        ? "bg-zinc-900/50 border-transparent text-zinc-800 cursor-not-allowed opacity-50"
                        : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  )}
                  title={ratio.label}
                >
                  {(() => {
                    if (ratio.id === 'auto') return <Scan className="w-3 h-3" />;
                    const IconMap: Record<string, any> = {
                      Square, Box, Smartphone, MonitorPlay, Monitor, Maximize
                    };
                    const IconComponent = IconMap[ratio.icon] || Box;
                    return <IconComponent className={cn("w-3 h-3", isActive && "fill-current")} />;
                  })()}
                  <span className="text-[8px] font-mono font-bold">{ratio.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Batch Count */}
        <div className="space-y-3">
          <label className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-zinc-500 font-bold">
            <span className="flex items-center gap-2"><Sliders className="w-3 h-3 text-zinc-400" /> {t('gen.batch')}</span>
            <span className="font-mono text-orange-400 bg-zinc-800 px-1.5 py-0.5 text-[10px] rounded-[1px]">x{imageCount}</span>
          </label>
          <div className="relative h-8 flex items-center bg-zinc-950 border border-zinc-800 px-2 rounded-[1px]">
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={imageCount}
              onChange={(e) => setImageCount(parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-orange-600 hover:accent-orange-500"
            />
            <div className="absolute inset-0 pointer-events-none flex justify-between px-3">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className={cn("w-[1px] h-2 mt-3", n <= imageCount ? "bg-orange-600" : "bg-zinc-800")} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Reference Zone */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-zinc-500 font-bold">
            <FolderOpen className="w-3 h-3 text-zinc-400" /> {t('gen.ref')}
          </label>
        </div>

        <ReferenceUploadZone
          files={refFiles}
          activeCategory={activeRefCategory}
          onCategoryChange={setActiveRefCategory}
          onFilesChange={handleFilesAdded}
          onClearCategory={handleClearCategory}
          onRemoveFile={handleRemoveFile}
          onUpdateTags={handleUpdateTags}
          onOpenLibrary={onOpenLibrary}
          onUploadComplete={onRefreshHistory}
          history={history}
        />
      </div>

      {/* Prompt Input Section (passed as children) */}
      {children}
    </div>
  );
});

GenerationControlPanel.displayName = 'GenerationControlPanel';

export default GenerationControlPanel;
