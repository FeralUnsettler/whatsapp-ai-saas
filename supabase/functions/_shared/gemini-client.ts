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

const DEFAULT_MODEL = 'gemini-1.5-flash';
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
    const model = config.model || DEFAULT_MODEL;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

    const requestBody = {
        systemInstruction: {
            parts: [{ text: systemPrompt }],
        },
        contents: conversationHistory,
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
    return messages.map((msg) => ({
        role: msg.direction === 'inbound' ? 'user' : 'model',
        parts: [{ text: msg.content }],
    }));
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
    const model = 'gemini-1.5-flash';
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
