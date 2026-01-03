import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GenerationResult, AnalyzedFile } from '../types/generation';
import { RefCategory } from '../components/ui/ReferenceUploadZone';
import { AI_MODELS, DEFAULT_MODEL_ID, DEFAULT_RATIO } from '../constants';

// State interface
interface GenerationState {
  // Core generation state
  prompt: string;
  selectedModel: string;
  aspectRatio: string;
  imageCount: number;
  isGenerating: boolean;
  isEnhancing: boolean;
  generatedImages: GenerationResult[];
  errorMsg: string | null;

  // History state
  history: GenerationResult[];
  isHistoryOpen: boolean;

  // Selection state for modal
  selectedImage: GenerationResult | null;

  // Library & Reference state
  isLibraryOpen: boolean;
  activeRefCategory: RefCategory;
  refFiles: Record<RefCategory, AnalyzedFile[]>;
}

// Actions interface
interface GenerationActions {
  // Core generation actions
  setPrompt: (prompt: string) => void;
  setSelectedModel: (modelId: string) => void;
  setAspectRatio: (ratio: string) => void;
  setImageCount: (count: number) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsEnhancing: (isEnhancing: boolean) => void;
  setGeneratedImages: (images: GenerationResult[]) => void;
  setErrorMsg: (msg: string | null) => void;

  // History actions
  setHistory: (history: GenerationResult[]) => void;
  setIsHistoryOpen: (isOpen: boolean) => void;
  removeFromHistory: (id: string) => void;
  clearAllHistory: () => void;
  addToHistory: (results: GenerationResult[]) => void;

  // Selection actions
  setSelectedImage: (image: GenerationResult | null) => void;

  // Library & Reference actions
  setIsLibraryOpen: (isOpen: boolean) => void;
  setActiveRefCategory: (category: RefCategory) => void;
  setRefFiles: (files: Record<RefCategory, AnalyzedFile[]>) => void;
  addRefFiles: (category: RefCategory, files: AnalyzedFile[]) => void;
  updateRefFile: (category: RefCategory, id: string, updates: Partial<AnalyzedFile>) => void;
  removeRefFile: (category: RefCategory, id: string) => void;
  clearRefCategory: (category: RefCategory) => void;

  // Compound actions
  resetGenerationState: () => void;
}

// Combined store type
type GenerationStore = GenerationState & GenerationActions;

export const useGenerationStore = create<GenerationStore>()(
  persist(
    (set) => ({
      // State
      prompt: '',
      selectedModel: DEFAULT_MODEL_ID || (AI_MODELS[0]?.id),
      aspectRatio: DEFAULT_RATIO,
      imageCount: 1,
      isGenerating: false,
      isEnhancing: false,
      generatedImages: [],
      errorMsg: null,
      history: [],
      isHistoryOpen: false,
      selectedImage: null,
      isLibraryOpen: false,
      activeRefCategory: 'subject',
      refFiles: {
        subject: [],
        style: [],
        scene: []
      },

      // Actions
      setPrompt: (prompt) => set({ prompt }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setAspectRatio: (aspectRatio) => set({ aspectRatio }),
      setImageCount: (imageCount) => set({ imageCount }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setIsEnhancing: (isEnhancing) => set({ isEnhancing }),
      setGeneratedImages: (generatedImages) => set({ generatedImages }),
      setErrorMsg: (errorMsg) => set({ errorMsg }),

      setHistory: (history) => set({ history }),
      setIsHistoryOpen: (isHistoryOpen) => set({ isHistoryOpen }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((item) => item.id !== id),
        generatedImages: state.generatedImages.filter((img) => img.id !== id),
        selectedImage: state.selectedImage?.id === id ? null : state.selectedImage
      })),
      clearAllHistory: () => set({ history: [] }),
      addToHistory: (results) => set((state) => ({ history: [...results, ...state.history] })),

      setSelectedImage: (selectedImage) => set({ selectedImage }),

      setIsLibraryOpen: (isLibraryOpen) => set({ isLibraryOpen }),
      setActiveRefCategory: (activeRefCategory) => set({ activeRefCategory }),
      setRefFiles: (refFiles) => set({ refFiles }),
      addRefFiles: (category, files) => set((state) => ({
        refFiles: {
          ...state.refFiles,
          [category]: [...state.refFiles[category], ...files]
        }
      })),
      updateRefFile: (category, id, updates) => set((state) => ({
        refFiles: {
          ...state.refFiles,
          [category]: state.refFiles[category].map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        }
      })),
      removeRefFile: (category, id) => set((state) => ({
        refFiles: {
          ...state.refFiles,
          [category]: state.refFiles[category].filter((f) => f.id !== id)
        }
      })),
      clearRefCategory: (category) => set((state) => ({
        refFiles: {
          ...state.refFiles,
          [category]: []
        }
      })),

      resetGenerationState: () => set({
        isGenerating: false,
        generatedImages: [],
        errorMsg: null,
        selectedImage: null
      })
    }),
    {
      name: 'benlab-generation-storage',
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        aspectRatio: state.aspectRatio,
        imageCount: state.imageCount
      })
    }
  )
);
