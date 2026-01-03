import { useCallback } from 'react';
import { generateImage } from '../services/imageGenerationService';
import { saveImage } from '../lib/db';
import { useGenerationStore } from '../store/generationStore';
import { useSettingsStore } from '../store/settingsStore';
import { AI_MODELS } from '../constants';
import { ReferenceImage } from '../types/generation';
import { RefCategory } from '../components/ui/ReferenceUploadZone';
import { fileToBase64 } from '../lib/fileUtils';

interface UseImageGenerationReturn {
  generate: (onSuccess?: () => Promise<void>) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Custom hook for handling image generation logic.
 */
export function useImageGeneration(): UseImageGenerationReturn {
  const {
    prompt,
    selectedModel,
    aspectRatio,
    imageCount,
    isGenerating,
    setIsGenerating,
    setGeneratedImages,
    setErrorMsg,
    setSelectedImage,
    refFiles,
    errorMsg
  } = useGenerationStore();

  const generate = useCallback(async (onSuccess?: () => Promise<void>) => {
    if (!prompt.trim()) return;

    // The token/key are now handled automatically by the ProxyPal resolver, 
    // but we can still check for provider-specific logic if needed.
    const model = AI_MODELS.find(m => m.id === selectedModel);

    // Reset state
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedImages([]);
    setSelectedImage(null);

    try {
      // Process reference images
      const referenceImages: ReferenceImage[] = [];

      const processCategory = async (cat: RefCategory, typeStr: 'SUBJECT' | 'STYLE' | 'SCENE') => {
        const categoryPromises = refFiles[cat].map(async (entry) => {
          const base64 = await fileToBase64(entry.file);
          return {
            base64,
            type: typeStr,
            mimeType: entry.file.type,
            filename: entry.file.name
          };
        });
        const categoryResults = await Promise.all(categoryPromises);
        referenceImages.push(...categoryResults);
      };

      // Process all categories in parallel as well
      await Promise.all([
        processCategory('subject', 'SUBJECT'),
        processCategory('style', 'STYLE'),
        processCategory('scene', 'SCENE')
      ]);

      // Call generation service
      const results = await generateImage({
        prompt,
        modelId: selectedModel,
        aspectRatio,
        count: imageCount,
        referenceImages
      });

      if (results && results.length > 0) {
        setGeneratedImages(results);

        // Save to IndexedDB
        for (const img of results) {
          await saveImage({
            ...img,
            prompt,
            source: 'generated'
          });
        }

        // Trigger history refresh
        if (onSuccess) {
          await onSuccess();
        }
      } else {
        throw new Error("No images returned from core.");
      }
    } catch (error: any) {
      console.error("Generation Failed", error);
      setErrorMsg(error.message || "Unknown System Failure");
    } finally {
      setIsGenerating(false);
    }
  }, [
    prompt,
    selectedModel,
    aspectRatio,
    imageCount,
    refFiles,
    setIsGenerating,
    setErrorMsg,
    setGeneratedImages,
    setSelectedImage
  ]);

  return {
    generate,
    isGenerating,
    error: errorMsg
  };
}