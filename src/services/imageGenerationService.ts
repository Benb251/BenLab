import { GenerateParams, GenerationResult } from '../types/generation';
import {
  AI_MODELS,
  BASE_URL_PROXY
} from '../constants';
import { cleanBase64 } from '../lib/fileUtils';
import { GoogleGenAI } from "@google/genai";

// --- INITIALIZATION ---
const getClient = (apiKey?: string) => {
  const key = apiKey || import.meta.env.VITE_API_KEY;
  if (!key) throw new Error("API Key Missing");
  return new GoogleGenAI({ apiKey: key });
};

const generateUniqueId = () => `gen_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

/**
 * Fetches available models from the local proxy
 */
export async function fetchModelsFromProxy(): Promise<any[]> {
  try {
    const key = [import.meta.env.VITE_API_KEY, 'proxypal-local']
      .find(k => typeof k === 'string' && k.trim() !== '' && k !== 'undefined' && k !== 'null') || 'proxypal-local';

    const response = await fetch(`${BASE_URL_PROXY}/models`, {
      headers: {
        'Authorization': `Bearer ${key.trim()}`,
        'X-API-Key': key.trim(),
        'api-key': key.trim()
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("[Service] Error fetching models from proxy:", error);
    return [];
  }
}

// --- GENERATION FUNCTIONS ---

// 1. PROXY GENERATION (OpenAI-compatible)
async function generateViaProxy(params: GenerateParams): Promise<Partial<GenerationResult>[]> {
  const { prompt, modelId, aspectRatio, count, apiKey, referenceImages } = params;
  const modelIdLower = modelId.toLowerCase();

  // Find the actual API model identifier from constants, or use the original if not found (case-insensitive)
  const modelInfo = AI_MODELS.find(m => m.id.toLowerCase() === modelIdLower);
  const apiModel = modelInfo?.apiModel || modelId;

  // ProxyPal typically uses /v1/chat/completions for all tasks
  const endpoint = `${BASE_URL_PROXY}/chat/completions`;

  // Robust Key Resolver
  const resolveKey = (): string => {
    const candidates = [
      'proxypal-local', // Primary for local proxy
      apiKey,
      import.meta.env.VITE_API_KEY
    ];

    for (const key of candidates) {
      if (typeof key === 'string' && key.trim() !== '' && key !== 'undefined' && key !== 'null') {
        const trimmed = key.trim();
        if (trimmed.startsWith('AIza') && candidates.includes('proxypal-local')) {
          continue;
        }
        return trimmed;
      }
    }
    return 'proxypal-local';
  };

  const key = resolveKey();

  /**
   * Generates a single image chunk with a unique seed.
   * Chunks are generated in parallel for maximum speed and diversity.
   */
  const generateSingleProxyImageChunk = async (seed: number): Promise<Partial<GenerationResult>[]> => {
    try {
      const userContent: any[] = [{ type: "text", text: prompt }];

      if (referenceImages && referenceImages.length > 0) {
        referenceImages.forEach((ref) => {
          const mimeType = ref.mimeType || 'image/jpeg';
          const base64Data = cleanBase64(ref.base64);
          userContent.push({
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Data}` }
          });
        });
      }

      const messages = referenceImages && referenceImages.length > 0
        ? [{ role: "user", content: userContent }]
        : [{ role: "user", content: prompt }];

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'X-API-Key': key,
          'api-key': key
        },
        body: JSON.stringify({
          model: apiModel,
          messages,
          n: 1, // Single image per chunk for maximum diversity
          seed: seed, // Unique seed for every single request
          quality: 'standard',
          response_format: 'b64_json',
          aspect_ratio: aspectRatio,
          aspectRatio: aspectRatio,
          image_config: {
            aspect_ratio: aspectRatio,
            count: 1,
            seed: seed
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Proxy Error (${response.status}): ${errText.substring(0, 100)}`);
      }

      const data = await response.json();
      const results: Partial<GenerationResult>[] = [];

      // Parse OpenAI format
      if (data.choices && Array.isArray(data.choices)) {
        data.choices.forEach((choice: any) => {
          if (choice.message?.images) {
            choice.message.images.forEach((img: any) => {
              const url = img.image_url?.url || img.url || img.b64_json;
              if (url) results.push({ id: generateUniqueId(), url, prompt, seed });
            });
          }
        });
      }

      // Parse DALL-E format
      if (results.length === 0 && data.data && Array.isArray(data.data)) {
        data.data.forEach((item: any) => {
          const url = item.url || item.b64_json;
          if (url) results.push({ id: generateUniqueId(), url, prompt: item.revised_prompt || prompt, seed });
        });
      }

      // Ensure we only return 1 unique image per chunk to prevent duplication
      return results.length > 0 ? [results[0]] : [];
    } catch (e: any) {
      console.error("[Service] Request Chunk Error:", e);
      return [];
    }
  };

  // Launch all requests in parallel for maximum performance
  console.log(`[Service] Dispatching ${count} parallel generation requests...`);
  const promises = Array.from({ length: count }, () => {
    const randomSeed = Math.floor(Math.random() * 2147483647);
    return generateSingleProxyImageChunk(randomSeed);
  });

  const settledResults = await Promise.allSettled(promises);

  const finalResults: Partial<GenerationResult>[] = [];
  settledResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      finalResults.push(...result.value);
    }
  });

  return finalResults;
}

// 2. GEMINI MODELS (Direct API)
async function generateGemini(params: GenerateParams): Promise<Partial<GenerationResult>[]> {
  const { prompt, modelId, aspectRatio, count, referenceImages, apiKey } = params;

  const ai = getClient(apiKey);
  const apiModel = AI_MODELS.find(m => m.id === modelId)?.apiModel || modelId;

  const parts: any[] = [];

  if (referenceImages && referenceImages.length > 0) {
    referenceImages.forEach(ref => {
      let contextLabel = "Reference Image:";
      if (ref.type === 'STYLE') contextLabel = "Style reference:";
      else if (ref.type === 'SUBJECT') contextLabel = "Subject reference:";
      else if (ref.type === 'SCENE') contextLabel = "Scene reference:";

      if (contextLabel) parts.push({ text: contextLabel });
      parts.push({
        inlineData: {
          mimeType: ref.mimeType || 'image/jpeg',
          data: cleanBase64(ref.base64)
        }
      });
    });
    parts.push({ text: "Generate an image based on these references and the following prompt:" });
  }

  parts.push({ text: prompt });

  const imageConfig: any = {};
  if (aspectRatio && aspectRatio !== 'auto') {
    imageConfig.aspectRatio = aspectRatio;
  }

  const generateSingleGeminiImage = async (): Promise<Partial<GenerationResult>[]> => {
    try {
      const response = await ai.models.generateContent({
        model: apiModel,
        contents: { parts },
        config: {
          imageConfig: imageConfig
        }
      });

      const results: Partial<GenerationResult>[] = [];
      if (response.candidates) {
        for (const candidate of response.candidates) {
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData) {
                results.push({
                  id: generateUniqueId(),
                  url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                  base64: part.inlineData.data
                });
              }
            }
          }
        }
      }
      return results;
    } catch (e: any) {
      console.error("Gemini SDK Error:", e);
      throw new Error(`Gemini Generation Failed: ${e.message}`);
    }
  };

  const promises = Array.from({ length: count }, () => generateSingleGeminiImage());
  const settledResults = await Promise.allSettled(promises);

  const allResults: Partial<GenerationResult>[] = [];
  settledResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value);
    } else {
      console.error(`Gemini request ${index + 1} failed:`, result.reason);
    }
  });

  if (allResults.length === 0 && settledResults.some(r => r.status === 'rejected')) {
    const firstError = settledResults.find(r => r.status === 'rejected') as PromiseRejectedResult;
    throw firstError.reason;
  }

  return allResults;
}

// 3. IMAGEN MODELS (Direct API)
async function generateImagen(params: GenerateParams): Promise<Partial<GenerationResult>[]> {
  const { prompt, aspectRatio, count, apiKey } = params;

  const ai = getClient(apiKey);
  const config: any = {
    numberOfImages: 1,
    aspectRatio: aspectRatio === 'auto' ? '1:1' : aspectRatio,
    outputMimeType: 'image/jpeg'
  };

  const generateSingleImagenImage = async (): Promise<Partial<GenerationResult>[]> => {
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: config
      });

      const results: Partial<GenerationResult>[] = [];
      if (response.generatedImages) {
        response.generatedImages.forEach((img) => {
          if (img.image && img.image.imageBytes) {
            results.push({
              id: generateUniqueId(),
              url: `data:image/jpeg;base64,${img.image.imageBytes}`,
              base64: img.image.imageBytes
            });
          }
        });
      }
      return results;
    } catch (e: any) {
      console.error("Imagen SDK Error:", e);
      throw new Error(`Imagen Generation Failed: ${e.message}`);
    }
  };

  const promises = Array.from({ length: count }, () => generateSingleImagenImage());
  const settledResults = await Promise.allSettled(promises);

  const allResults: Partial<GenerationResult>[] = [];
  settledResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value);
    }
  });

  if (allResults.length === 0 && settledResults.some(r => r.status === 'rejected')) {
    const firstError = settledResults.find(r => r.status === 'rejected') as PromiseRejectedResult;
    throw firstError.reason;
  }

  return allResults;
}

// --- MAIN EXPORT ---

export async function generateImage(params: GenerateParams): Promise<GenerationResult[]> {
  const modelIdLower = params.modelId.toLowerCase();
  console.log(`[Service] Generating with ${params.modelId} (mapped to ${modelIdLower})`);

  let partialResults: Partial<GenerationResult>[] = [];

  // Find model info using case-insensitive ID
  const modelInfo = AI_MODELS.find(m => m.id.toLowerCase() === modelIdLower);

  // If model is not in static list, default to PROXY since we are in a proxy-centric environment
  // and models are usually fetched dynamically from the proxy.
  const provider = modelInfo?.provider || 'PROXY';

  console.log(`[Service] Provider identified: ${provider} for model ${params.modelId}`);

  try {
    if (provider === 'PROXY') {
      partialResults = await generateViaProxy(params);
    } else if (modelIdLower.includes('imagen')) {
      partialResults = await generateImagen(params);
    } else {
      partialResults = await generateGemini(params);
    }

    if (partialResults.length === 0) {
      throw new Error("No images returned from core.");
    }

    // Final Aggressive De-duplication and Count Limit
    const finalizedUnique: GenerationResult[] = [];
    const seenUrls = new Set<string>();

    for (const res of partialResults) {
      const url = res.url || '';
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        finalizedUnique.push({
          ...res,
          id: res.id || generateUniqueId(),
          url: url,
          prompt: params.prompt,
          modelId: params.modelId,
          aspectRatio: params.aspectRatio,
          timestamp: Date.now()
        } as GenerationResult);
      }
    }

    // Strictly respect batch size
    return finalizedUnique.slice(0, params.count);

  } catch (error: any) {
    console.error("Generation Service Error:", error);
    throw new Error(error.message || "Generation Failed");
  }
}
