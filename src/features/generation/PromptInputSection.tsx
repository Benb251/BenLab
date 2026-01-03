import React, { memo, useCallback, useMemo } from 'react';
import { Terminal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fileToBase64 } from '@/lib/fileUtils';
import { AnalyzedFile } from '@/types/generation';
import { magicEnhancePrompt } from '@/services/aiAnalysisService';
import { useGenerationStore } from '@/store/generationStore';
import { RefCategory } from '@/components/ui/ReferenceUploadZone';

const PromptInputSection: React.FC = memo(() => {
  // Zustand store - only grab what this component needs
  const {
    prompt,
    setPrompt,
    isEnhancing,
    setIsEnhancing,
    refFiles
  } = useGenerationStore();

  // Memoize the validation check to avoid recalculating on every render
  const hasContent = useMemo(() => {
    return prompt.trim() || Object.values(refFiles).some((arr: AnalyzedFile[]) => arr.length > 0);
  }, [prompt, refFiles]);

  const handleMagicEnhance = useCallback(async () => {
    if (!hasContent) return;

    setIsEnhancing(true);
    try {
      const imagesForMagic: { base64: string; type: string; analysisKeywords?: string }[] = [];

      const processFiles = async (category: RefCategory, typeLabel: string) => {
        for (const fileObj of refFiles[category]) {
          const b64 = await fileToBase64(fileObj.file);
          imagesForMagic.push({
            base64: b64,
            type: typeLabel,
            analysisKeywords: fileObj.analysisResult
          });
        }
      };

      await processFiles('subject', 'SUBJECT');
      await processFiles('style', 'STYLE');
      await processFiles('scene', 'SCENE');

      const enhancedPrompt = await magicEnhancePrompt(prompt, imagesForMagic, "BENLAB_INTERNAL_TOKEN");
      setPrompt(enhancedPrompt);
    } catch (e) {
      console.error("Enhancement failed", e);
    } finally {
      setIsEnhancing(false);
    }
  }, [hasContent, refFiles, prompt, setIsEnhancing, setPrompt]);

  // Memoize the onChange handler
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, [setPrompt]);

  return (
    <div className="space-y-3 pb-8">
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-zinc-500 font-bold">
        <Terminal className="w-3 h-3 text-zinc-400" /> Command Input
      </label>
      <div className={cn("relative group transition-all duration-300", isEnhancing && "opacity-80")}>
        <div className="absolute -inset-0.5 bg-gradient-to-b from-orange-500/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-[2px] blur-sm pointer-events-none" />

        <textarea
          value={prompt}
          onChange={handlePromptChange}
          disabled={isEnhancing}
          placeholder="ENTER VISUAL PARAMETERS..."
          className={cn(
            "relative w-full h-40 bg-zinc-950/50 backdrop-blur-sm border border-white/10 p-5 text-base md:text-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-950/80 transition-all resize-none font-sans leading-relaxed rounded-[1px] shadow-inner",
            isEnhancing && "cursor-wait opacity-50"
          )}
        />

        <button
          onClick={handleMagicEnhance}
          disabled={isEnhancing || !hasContent}
          className="absolute bottom-3 right-3 px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:text-orange-400 hover:border-orange-500/50 text-zinc-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed group/magic"
        >
          <Sparkles className={cn("w-3 h-3", isEnhancing && "animate-spin text-orange-500")} />
          {isEnhancing ? "SYNTHESIZING..." : "MAGIC ENHANCE"}
        </button>
      </div>
    </div>
  );
});

PromptInputSection.displayName = 'PromptInputSection';

export default PromptInputSection;
