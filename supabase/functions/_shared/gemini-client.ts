/**
 * Gemini API Client
 * Handles communication with Google's Gemini API
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
const DEFAULT_MAX_TOKENS = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(
    systemPrompt: string,
    conversationHistory: GeminiMessage[],
    config: GeminiConfig
): Promise<{ text: string; tokens: number }> {
    let model = config.model || DEFAULT_MODEL;

    // Mapping based on confirmed available models in user logs
    const modelMap: Record<string, string> = {
        'gemini-pro': 'gemini-pro-latest',
        'gemini-1.5-pro': 'gemini-pro-latest',
        'gemini-1.5-flash': 'gemini-flash-latest',
        'gemini-1.5-flash-latest': 'gemini-flash-latest',
        'gemini-1.5-flash-8b': 'gemini-flash-latest' // Fallback to standard flash
    };
    
    if (modelMap[model]) {
        model = modelMap[model];
    }

    // confirmed that v1beta works for these names in their project
    const apiVersion = 'v1beta';
    const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${config.apiKey}`;
    
    // Inject system prompt manually and handle history merging
    const mergedHistory: GeminiMessage[] = [
        {
            role: 'user',
            parts: [{ text: `System Instructions:\n${systemPrompt}\n\nStart of conversation:` }]
        },
        {
            role: 'model',
            parts: [{ text: 'Understood.' }]
        }
    ];

    for (const msg of conversationHistory) {
        if (mergedHistory.length > 0 && mergedHistory[mergedHistory.length - 1].role === msg.role) {
            mergedHistory[mergedHistory.length - 1].parts[0].text += `\n${msg.parts[0].text}`;
        } else {
            mergedHistory.push(msg);
        }
    }

    const requestBody = {
        contents: mergedHistory,
        generationConfig: {
            temperature: config.temperature ?? DEFAULT_TEMPERATURE,
            maxOutputTokens: config.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
            topP: 0.95,
        }
    };

    let lastError: Error | null = null;
    const fallbacks = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`DEBUG: Calling Gemini API (${apiVersion}): ${model}`);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (response.status === 404) {
                console.error(`DEBUG: Model ${model} NOT FOUND (404).`);
                
                // Try fallbacks if first attempt fails with 404
                if (fallbacks.length > 0) {
                    const nextModel = fallbacks.shift();
                    if (nextModel === model) {
                        const nextNext = fallbacks.shift();
                        if (nextNext) {
                            console.log(`DEBUG: Trying fallback model: ${nextNext}`);
                            return callGemini(systemPrompt, conversationHistory, { ...config, model: nextNext });
                        }
                    } else if (nextModel) {
                        console.log(`DEBUG: Trying fallback model: ${nextModel}`);
                        return callGemini(systemPrompt, conversationHistory, { ...config, model: nextModel });
                    }
                }
            }

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
            }

            const data: GeminiResponse = await response.json();
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response candidates from Gemini');
            }

            const candidate = data.candidates[0];
            const text = candidate.content?.parts?.map((part) => part.text).join('') || '';
            const tokens = data.usageMetadata?.totalTokenCount || 0;
            return { text, tokens };
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            lastError = error;
            console.error(`DEBUG: Attempt ${attempt + 1} failed: ${error.message}`);
            
            if (error.message.includes('429')) {
                // Intensive backoff for rate limits
                const wait = 5000 * (attempt + 1);
                console.log(`DEBUG: Quota exceeded, waiting ${wait}ms...`);
                await sleep(wait);
            } else if (attempt < MAX_RETRIES) {
                await sleep(RETRY_DELAY_MS * (attempt + 1));
            }
        }
    }

    throw lastError || new Error('Unknown error calling Gemini API');
}

export function formatConversationHistory(
    messages: { direction: string; content: string }[]
): GeminiMessage[] {
    const formatted: GeminiMessage[] = [];
    for (const msg of messages) {
        const role = msg.direction === 'inbound' ? 'user' : 'model';
        const text = msg.content || '';
        if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
            formatted[formatted.length - 1].parts[0].text += `\n${text}`;
        } else {
            formatted.push({ role, parts: [{ text }] });
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
    const model = 'gemini-1.5-flash-latest';
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${config.apiKey}`;

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
