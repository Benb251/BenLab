import React, { memo, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingGlitch, ShimmerButton } from '@/components/ui';
import { useGenerationStore } from '@/store/generationStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation } from '@/lib/translations';
import { useImageGeneration } from '@/hooks/useImageGeneration';

interface ExecuteButtonProps {
  onRefreshHistory: () => Promise<void>;
}

const ExecuteButton: React.FC<ExecuteButtonProps> = memo(({ onRefreshHistory }) => {
  const { prompt } = useGenerationStore();
  const { generate, isGenerating } = useImageGeneration();
  const { language } = useSettingsStore();
  const t = useTranslation(language);

  const hasContent = !!prompt;

  const handleExecute = useCallback(() => {
    generate(onRefreshHistory);
  }, [generate, onRefreshHistory]);

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-zinc-900 border-t border-zinc-800 z-50 backdrop-blur-md flex gap-2">
      <ShimmerButton
        onClick={handleExecute}
        disabled={isGenerating || !hasContent}
        className={cn(
          "w-full h-14 flex items-center justify-center gap-3 uppercase tracking-[0.2em] font-bold text-sm transition-all duration-300",
          isGenerating ? "cursor-wait opacity-80" : "hover:scale-[1.02]",
          !hasContent && !isGenerating && "opacity-50 cursor-not-allowed" // Handle disabled state visibly
        )}
        background="linear-gradient(to bottom right, #18181b, #09090b)" // Zinc-900 to Zinc-950
        shimmerColor="#f97316" // Orange-500
        shimmerDuration="2.5s"
      >
        {isGenerating ? (
          <>
            <LoadingGlitch mode="mini" />
            <span className="animate-pulse">{t('gen.processing')}</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 text-orange-500 fill-current" />
            <span className="text-zinc-200 group-hover:text-white transition-colors">
              {t('gen.execute')}
            </span>
          </>
        )}
      </ShimmerButton>
    </div>
  );
});

ExecuteButton.displayName = 'ExecuteButton';

export default ExecuteButton;
