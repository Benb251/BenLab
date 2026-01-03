import { GEMINI_VISION_MODEL, BASE_URL_PROXY } from "../constants";
import { cleanBase64 } from "../lib/fileUtils";

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
  return match ? match[1] : "image/jpeg";
};

const resolveProxyKey = () => {
  const candidates = [
    'proxypal-local',
    import.meta.env.VITE_API_KEY
  ];

  for (const key of candidates) {
    if (typeof key === 'string' && key.trim() !== '' && key !== 'undefined' && key !== 'null') {
      const trimmed = key.trim();
      // Skip if it looks like a direct Google key and we're targeting the proxy
      if (trimmed.startsWith('AIza') && candidates.includes('proxypal-local')) {
        continue;
      }
      return trimmed;
    }
  }
  return 'proxypal-local';
};

/**
 * Analyzes a reference image to extract scene descriptions and artistic direction.
 */
export async function analyzeReferenceImage(base64: string, type: 'SUBJECT' | 'STYLE' | 'SCENE', mimeType: string): Promise<string> {
  let promptText = "Analyze this image and return strictly a comma-separated list of descriptive keywords/tags. DO NOT write full sentences.";

  switch (type) {
    case 'SUBJECT':
      promptText += " Focus ONLY on the character/object's physical appearance, clothing, distinct features, and pose.";
      break;
    case 'STYLE':
      promptText += " Focus ONLY on the art medium (e.g., 3D render, oil painting), lighting, color palette, texture, and rendering technique.";
      break;
    case 'SCENE':
      promptText += " Focus ONLY on the environment, background elements, architecture, and atmosphere. Ignore the main character.";
      break;
  }

  try {
    const key = resolveProxyKey();
    const response = await fetch(`${BASE_URL_PROXY}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'X-API-Key': key,
        'api-key': key
      },
      body: JSON.stringify({
        model: GEMINI_VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${cleanBase64(base64)}`
                }
              }
            ]
          }
        ]
      })
    });

    const text = await response.text();
    console.log("[Analysis] Raw Proxy Response:", text.substring(0, 200));

    if (!response.ok) {
      throw new Error(`Proxy Error (${response.status}): ${text.substring(0, 100)}`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) data = JSON.parse(match[0]);
      else throw e;
    }

    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

/**
 * Uses Gemini to enhance and "noir-ify" a user prompt.
 */
export const magicEnhancePrompt = async (
  currentPrompt: string,
  images: { base64: string; type: string; analysisKeywords?: string }[],
  _token: string
): Promise<string> => {
  const systemInstruction = `You are an Elite AI Art Director. Your goal is to write ONE cohesive, highly detailed image generation prompt.
Synthesize the following inputs:
1. USER IDEA: The core intent.
2. REFERENCE IMAGES: Visual guides provided by the user.
3. REFERENCE KEYWORDS: Specific traits extracted from the images.

RULES:
- If an image is marked 'SUBJECT', prioritize its physical description.
- If an image is marked 'STYLE', prioritize its art medium, lighting, and color palette.
- If an image is marked 'SCENE', prioritize the environment description.
- Output ONLY the final prompt string. No chat, no explanations.

SAFETY GUIDELINES:
- Avoid overly revealing clothing descriptions. 
- Describe clothing in a modest, professional manner.
- Focus on color, material, and general style.`;

  const messages: any[] = [
    { role: "system", content: systemInstruction }
  ];

  const userContent: any[] = [
    { type: "text", text: `USER IDEA: "${currentPrompt}"` }
  ];

  if (images && images.length > 0) {
    for (const img of images) {
      userContent.push({
        type: "text",
        text: `REFERENCE TYPE: [${img.type}]. KEYWORDS: [${img.analysisKeywords || 'None'}]. VISUAL DATA:`
      });
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${getMimeType(img.base64)};base64,${cleanBase64(img.base64)}`
        }
      });
    }
  } else {
    userContent.push({ type: "text", text: "NO REFERENCE IMAGES PROVIDED." });
  }

  messages.push({ role: "user", content: userContent });

  try {
    const key = resolveProxyKey();
    const response = await fetch(`${BASE_URL_PROXY}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'X-API-Key': key,
        'api-key': key
      },
      body: JSON.stringify({
        model: GEMINI_VISION_MODEL,
        messages: messages
      })
    });

    const text = await response.text();
    console.log("[Enhance] Raw Proxy Response:", text.substring(0, 200));

    if (!response.ok) {
      throw new Error(`Proxy Error (${response.status}): ${text.substring(0, 100)}`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) data = JSON.parse(match[0]);
      else throw e;
    }

    return data.choices?.[0]?.message?.content || currentPrompt;
  } catch (error) {
    console.error("Magic Enhance Error:", error);
    return currentPrompt;
  }
};