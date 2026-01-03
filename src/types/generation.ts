
export type ReferenceType = 'SUBJECT' | 'STYLE' | 'SCENE';

export interface ReferenceImage {
  base64: string;
  type: ReferenceType;
  mediaId?: string; // For Flow/Whisk uploads
  filename?: string;
  mimeType?: string;
}

export interface AnalyzedFile {
  id: string;
  file: File;
  preview: string; // URL.createObjectURL
  analysisStatus: 'pending' | 'loading' | 'done' | 'error';
  analysisResult?: string;
}

export interface GenerateParams {
  prompt: string;
  modelId: string; // The UI Model ID
  aspectRatio: string;
  count: number;
  token?: string; // OAuth Token for Flow/Whisk
  apiKey?: string; // API Key for GenAI
  referenceImages?: ReferenceImage[];
}

export interface GenerationResult {
  id: string; // Unique ID for layout animations
  url: string;
  base64?: string;
  seed?: number;
  // Metadata for inspection
  prompt: string;
  modelId: string;
  aspectRatio: string;
  timestamp: number;
  // Unified Asset Management Fields
  source?: 'generated' | 'upload';
  uploadType?: 'SUBJECT' | 'STYLE' | 'SCENE' | null;
}
