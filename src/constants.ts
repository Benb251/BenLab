
// --- API CONFIGURATION ---
// GenAI Endpoint
export const BASE_URL_GENAI = "https://generativelanguage.googleapis.com/v1beta";
export const BASE_URL_PROXY = "http://localhost:8317/v1";

// --- SYSTEM CONFIGURATION ---
export const APP_CONFIG = {
  name: "BenLab Studio",
  version: "2.1.0",
  coordinates: "34.0522° N, 118.2437° W",
};

export const GEMINI_VISION_MODEL = "gemini-3-flash-preview";
export const DEFAULT_MODEL_ID = "gemini-3-flash-preview";

// --- AI MODELS ---
export interface AIModel {
  id: string;
  name: string;
  badge: string;
  description: string;
  apiModel: string; // Internal API Identifier
  provider: 'GENAI' | 'PROXY';
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    badge: 'NEW',
    description: 'Latest high-speed multimodal model with advanced reasoning.',
    apiModel: 'gemini-3-flash-preview',
    provider: 'PROXY'
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro',
    badge: 'PRO',
    description: 'Enhanced quality and creative accuracy for complex visions.',
    apiModel: 'gemini-3-pro-image-preview',
    provider: 'PROXY'
  }
];

// --- ASPECT RATIOS ---
export const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', icon: 'Square' },
  { id: '3:2', label: '3:2', icon: 'Box' },
  { id: '2:3', label: '2:3', icon: 'Smartphone' },
  { id: '16:9', label: '16:9', icon: 'MonitorPlay' },
  { id: '9:16', label: '9:16', icon: 'Smartphone' },
  { id: '21:9', label: '21:9', icon: 'Maximize' },
  { id: '4:3', label: '4:3', icon: 'Monitor' },
  { id: '3:4', label: '3:4', icon: 'Smartphone' },
];

// --- LOGIC MAP: MODEL vs RATIO CONSTRAINTS ---
export const MODEL_RATIO_LIMITS: Record<string, string[]> = {
  'gemini-3-flash-preview': ['1:1', '3:2', '2:3', '16:9', '9:16', '21:9', '4:3', '3:4'],
  'gemini-3-pro-image-preview': ['1:1', '3:2', '2:3', '16:9', '9:16', '21:9', '4:3', '3:4']
};

export const DEFAULT_RATIO = '1:1';
