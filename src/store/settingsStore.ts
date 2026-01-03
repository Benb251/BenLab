import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'vi';

interface SettingsState {
    language: Language;
    soundEnabled: boolean;
    defaultRatio: string;
    negativePrompt: string;

    setLanguage: (lang: Language) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setDefaultRatio: (ratio: string) => void;
    setNegativePrompt: (prompt: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: 'en',
            soundEnabled: true,
            defaultRatio: '1:1',
            negativePrompt: '',

            setLanguage: (language) => set({ language }),
            setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
            setDefaultRatio: (defaultRatio) => set({ defaultRatio }),
            setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
        }),
        {
            name: 'benlab_settings', // unique name for localStorage key
        }
    )
);
