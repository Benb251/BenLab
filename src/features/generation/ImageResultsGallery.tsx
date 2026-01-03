import React, { memo, useCallback, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { LoadingGlitch, ImageResultGrid } from '@/components/ui';
import { useGenerationStore } from '@/store/generationStore';
import { GenerationResult } from '@/types/generation';

const ImageResultsGallery: React.FC = memo(() => {
    // Zustand store - only grab what this component needs
    const {
        isGenerating,
        generatedImages,
        errorMsg,
        setSelectedImage
    } = useGenerationStore();

    // Memoize the onSelect callback to prevent ImageResultGrid re-renders
    const handleSelect = useCallback((img: GenerationResult) => {
        setSelectedImage(img);
    }, [setSelectedImage]);

    return (
        <div className="flex-1 relative bg-transparent flex flex-col overflow-hidden">

            {/* Technical Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}
            />

            {/* --- MAIN CONTENT SWITCHER --- */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">

                {/* 1. LOADING STATE */}
                {isGenerating && (
                    <div className="absolute inset-0 z-50">
                        <LoadingGlitch mode="loading" />
                    </div>
                )}

                {/* 2. RESULTS STATE */}
                {!isGenerating && generatedImages.length > 0 && (
                    <ImageResultGrid
                        images={generatedImages}
                        onSelect={handleSelect}
                    />
                )}

                {/* 3. IDLE / ERROR STATE */}
                {!isGenerating && generatedImages.length === 0 && (
                    <div className="w-full h-full">
                        {errorMsg ? (
                            <div className="flex flex-col items-center justify-center h-full gap-6 opacity-80 select-none">
                                <AlertTriangle className="w-20 h-20 text-red-500 stroke-[0.5]" />
                                <div className="text-center space-y-2">
                                    <h3 className="font-['Oswald'] text-2xl font-bold tracking-[0.3em] text-red-500">
                                        SYSTEM FAILURE
                                    </h3>
                                    <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase max-w-md mx-auto">
                                        {errorMsg}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <LoadingGlitch mode="idle" />
                        )}
                    </div>
                )}
            </div>

            {/* HUD Elements */}
            <div className="absolute top-8 left-8 flex gap-2 opacity-30 pointer-events-none z-40">
                <div className="w-1.5 h-1.5 bg-zinc-400" />
                <div className="w-1.5 h-1.5 bg-zinc-600" />
                <div className="w-1.5 h-1.5 bg-zinc-800" />
            </div>
            <div className="absolute bottom-8 right-8 font-mono text-[9px] text-zinc-700 tracking-[0.2em] uppercase pointer-events-none z-40">
                BenLab // Neural Engine V.2.0
            </div>

        </div>
    );
});

ImageResultsGallery.displayName = 'ImageResultsGallery';

export default ImageResultsGallery;
