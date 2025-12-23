/**
 * Gemini API Client
 * Handles communication with Google's Gemini Pro API
 * with retry logic and error handling.
 */

interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

interface GeminiResponse {
    candidates: {
        content: {
            parts: { text: string }[];
        };
        finishReason: string;
    }[];
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

interface GeminiConfig {
    apiKey: string;
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
}

const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 500;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call Gemini API with retry logic
 */
export async function callGemini(
    systemPrompt: string,
    conversationHistory: GeminiMessage[],
    config: GeminiConfig
): Promise<{ text: string; tokens: number }> {
    let model = config.model || DEFAULT_MODEL;

    // Map custom/legacy model names to valid API models
    const modelMap: Record<string, string> = {
        'gemini-1.5-flash-latest': 'gemini-2.0-flash',
        'gemini-1.5-flash': 'gemini-2.0-flash',
        'gemini-2.0-flash-latest': 'gemini-2.0-flash',
        'gemini-2.5-flash': 'gemini-2.5-flash',
        'gemini-3-flash': 'gemini-2.5-pro',
        'gemini-pro': 'gemini-2.0-flash', // Fallback for Pro since 1.0 is missing
    };
    if (modelMap[model]) {
        model = modelMap[model];
    }

    // Use v1 for stable models and v1beta for experimental ones
    // Use v1beta for 2.x models as they are the latest
    const apiVersion = (model.includes('exp') || model.includes('gemini-2')) ? 'v1beta' : 'v1';
    const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${config.apiKey}`;
    
    console.log(`DEBUG: Calling Gemini API: ${model} | Version: ${apiVersion}`);

    // We ensure the conversation history doesn't collide with our acknowledgment model role
    const combinedHistory: GeminiMessage[] = [
        {
            role: 'user',
            parts: [{ text: `System Instructions:\n${systemPrompt}\n\nStart of conversation:` }]
        },
        {
            role: 'model',
            parts: [{ text: 'Understood. I will follow these instructions.' }]
        }
    ];

    // If history starts with 'model', wrap it or merge it to keep alternation
    // But usually history starts with 'user' after the system prompt injection.
    for (const msg of conversationHistory) {
        if (combinedHistory[combinedHistory.length - 1].role === msg.role) {
            // Merge if role is same as last injected
            combinedHistory[combinedHistory.length - 1].parts[0].text += `\n${msg.parts[0].text}`;
        } else {
            combinedHistory.push(msg);
        }
    }

    const requestBody = {
        // systemInstruction: systemInstructionProp, // Disabled to avoid 400 errors or compatibility issues
        contents: combinedHistory,
        generationConfig: {
            temperature: config.temperature ?? DEFAULT_TEMPERATURE,
            maxOutputTokens: config.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
            topP: 0.95,
        },
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
        ],
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
            }

            const data: GeminiResponse = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response candidates from Gemini');
            }

            const candidate = data.candidates[0];

            if (candidate.finishReason === 'SAFETY') {
                throw new Error('Response blocked by safety filters');
            }

            const text = candidate.content.parts
                .map((part) => part.text)
                .join('');

            const tokens = data.usageMetadata?.totalTokenCount || 0;

            return { text, tokens };
        } catch (error) {
            lastError = error as Error;
            console.error(`Gemini API attempt ${attempt + 1} failed:`, error);

            // Fallback to gemini-1.0-pro on 404 (Model Not Found) if we aren't already using it
            if (lastError.message.includes('error 404')) {
                console.error(`ERROR: Model ${model} not found. Attempting model diagnostics...`);
                try {
                    const listUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${config.apiKey}`;
                    const listResp = await fetch(listUrl);
                    if (listResp.ok) {
                        const listData = await listResp.json();
                        const models = listData.models?.map((m: { name: string }) => m.name.replace('models/', '')) || [];
                        console.log('DEBUG: Available models for this key:', models);
                    }
                } catch (e) {
                    console.error('Failed to list models:', e);
                }

                if (model !== 'gemini-2.0-flash') {
                    console.log(`Model ${model} fallback to gemini-2.0-flash...`);
                    return callGemini(systemPrompt, conversationHistory, { ...config, model: 'gemini-2.0-flash' });
                }
            }

            if (attempt < MAX_RETRIES) {
                await sleep(RETRY_DELAY_MS * (attempt + 1));
            }
        }
    }

    throw lastError || new Error('Unknown error calling Gemini API');
}

/**
 * Format conversation history for Gemini API
 */
export function formatConversationHistory(
    messages: { direction: string; content: string }[]
): GeminiMessage[] {
    const formatted: GeminiMessage[] = [];
    
    for (const msg of messages) {
        const role = msg.direction === 'inbound' ? 'user' : 'model';
        const text = msg.content || '';
        
        if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
            // Merge consecutive messages from same role
            formatted[formatted.length - 1].parts[0].text += `\n${text}`;
        } else {
            formatted.push({
                role,
                parts: [{ text }],
            });
        }
    }
    
    return formatted;
}

/**
 * Analyze image with Gemini Vision
 */
export async function analyzeImage(
    imageBase64: string,
    mimeType: string,
    prompt: string,
    config: GeminiConfig
): Promise<string> {
    const model = 'gemini-2.0-flash';
    // Use v1beta for 2.0 vision
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType,
                            data: imageBase64,
                        },
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500,
        },
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini Vision error ${response.status}: ${errorBody}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No vision response from Gemini');
    }

    return data.candidates[0].content.parts.map((part) => part.text).join('');
}
