/**
 * Z-API WhatsApp Client
 * Handles sending messages via Z-API
 * Docs: https://developer.z-api.io/
 */

interface ZAPIConfig {
    instanceId: string;
    token: string;
    securityToken?: string;
}

interface SendMessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

const ZAPI_BASE_URL = 'https://api.z-api.io';

/**
 * Build Z-API endpoint URL
 */
function buildUrl(config: ZAPIConfig, endpoint: string): string {
    return `${ZAPI_BASE_URL}/instances/${config.instanceId}/token/${config.token}/${endpoint}`;
}

/**
 * Build headers with Client-Token
 */
function buildHeaders(config: ZAPIConfig): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (config.securityToken) {
        headers['Client-Token'] = config.securityToken;
    }
    return headers;
}

/**
 * Send a text message via Z-API
 */
export async function sendTextMessage(
    to: string,
    text: string,
    config: ZAPIConfig
): Promise<SendMessageResult> {
    const url = buildUrl(config, 'send-text');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(config),
            body: JSON.stringify({
                phone: to.replace(/\D/g, ''), // Clean phone number
                message: text,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || `HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            messageId: data.messageId || data.zapiMessageId,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Send an image message via Z-API
 */
export async function sendImageMessage(
    to: string,
    imageUrl: string,
    caption: string | undefined,
    config: ZAPIConfig
): Promise<SendMessageResult> {
    const url = buildUrl(config, 'send-image');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(config),
            body: JSON.stringify({
                phone: to.replace(/\D/g, ''),
                image: imageUrl,
                caption: caption || '',
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || `HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            messageId: data.messageId || data.zapiMessageId,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Send an audio message via Z-API
 */
export async function sendAudioMessage(
    to: string,
    audioUrl: string,
    config: ZAPIConfig
): Promise<SendMessageResult> {
    const url = buildUrl(config, 'send-audio');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(config),
            body: JSON.stringify({
                phone: to.replace(/\D/g, ''),
                audio: audioUrl,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || `HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            messageId: data.messageId || data.zapiMessageId,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Send a document via Z-API
 */
export async function sendDocumentMessage(
    to: string,
    documentUrl: string,
    fileName: string,
    config: ZAPIConfig
): Promise<SendMessageResult> {
    const url = buildUrl(config, 'send-document/url');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: buildHeaders(config),
            body: JSON.stringify({
                phone: to.replace(/\D/g, ''),
                document: documentUrl,
                fileName: fileName,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || `HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            messageId: data.messageId || data.zapiMessageId,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Read messages (mark as read)
 */
export async function readMessage(
    phone: string,
    messageId: string,
    config: ZAPIConfig
): Promise<void> {
    const url = buildUrl(config, 'read-message');

    await fetch(url, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify({
            phone: phone.replace(/\D/g, ''),
            messageId: messageId,
        }),
    });
}

/**
 * Get instance status
 */
export async function getInstanceStatus(
    config: ZAPIConfig
): Promise<{ connected: boolean; phone?: string }> {
    const url = buildUrl(config, 'status');
    const headers = buildHeaders(config);

    try {
        console.log('DEBUG: Fetching Z-API status from:', url);
        const response = await fetch(url, { headers });
        const data = await response.json();
        console.log('DEBUG: Z-API status response:', data);

        return {
            connected: data.connected === true,
            phone: data.phone,
        };
    } catch (error) {
        console.error('DEBUG: Z-API status fetch failed:', error);
        return { connected: false };
    }
}

/**
 * Get Z-API config from environment
 */
export function getZAPIConfig(): ZAPIConfig {
    const instanceId = Deno.env.get('ZAPI_INSTANCE_ID');
    const token = Deno.env.get('ZAPI_TOKEN');
    const securityToken = Deno.env.get('ZAPI_SECURITY_TOKEN');

    if (!instanceId || !token) {
        throw new Error('Missing ZAPI_INSTANCE_ID or ZAPI_TOKEN');
    }

    return {
        instanceId,
        token,
        securityToken,
    };
}

/**
 * Parse Z-API webhook payload
 */
export interface ZAPIWebhookMessage {
    phone: string;
    messageId: string;
    isGroup: boolean;
    isFromMe: boolean;
    messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location' | 'contact' | 'unknown';
    content: string;
    imageUrl?: string;
    audioUrl?: string;
    videoUrl?: string;
    documentUrl?: string;
    senderName?: string;
    timestamp: number;
}

export function parseWebhookPayload(body: Record<string, unknown>): ZAPIWebhookMessage | null {
    console.log('DEBUG: Parsing Webhook Payload:', JSON.stringify(body, null, 2));

    // Skip if from me or group message
    if (body.isFromMe === true || body.isGroup === true) {
        console.log('DEBUG: Skipped (from me or group)');
        return null;
    }

    const rawPhone = body.phone as string;
    const phone = rawPhone ? rawPhone.split('@')[0] : '';
    const messageId = body.messageId as string || body.id as string;

    if (!phone || !messageId) {
        console.log('DEBUG: Skipped (missing phone or messageId)', { phone: rawPhone, messageId });
        return null;
    }

    let messageType: ZAPIWebhookMessage['messageType'] = 'unknown';
    let content = '';
    let imageUrl: string | undefined;
    let audioUrl: string | undefined;
    let videoUrl: string | undefined;
    let documentUrl: string | undefined;

    // Text message
    if (body.text && typeof body.text === 'object') {
        messageType = 'text';
        content = (body.text as Record<string, string>).message || '';
    } else if (typeof body.text === 'string') {
        messageType = 'text';
        content = body.text;
    }

    // Image message
    if (body.image && typeof body.image === 'object') {
        messageType = 'image';
        const img = body.image as Record<string, string>;
        imageUrl = img.imageUrl || img.url;
        content = img.caption || '[Imagem]';
    }

    // Audio message
    if (body.audio && typeof body.audio === 'object') {
        messageType = 'audio';
        const aud = body.audio as Record<string, string>;
        audioUrl = aud.audioUrl || aud.url;
        content = '[Áudio]';
    }

    // Video message
    if (body.video && typeof body.video === 'object') {
        messageType = 'video';
        const vid = body.video as Record<string, string>;
        videoUrl = vid.videoUrl || vid.url;
        content = vid.caption || '[Vídeo]';
    }

    // Document message
    if (body.document && typeof body.document === 'object') {
        messageType = 'document';
        const doc = body.document as Record<string, string>;
        documentUrl = doc.documentUrl || doc.url;
        content = doc.fileName || '[Documento]';
    }

    // Sticker
    if (body.sticker) {
        messageType = 'sticker';
        content = '[Sticker]';
    }

    // Location
    if (body.location) {
        messageType = 'location';
        const loc = body.location as Record<string, unknown>;
        content = `[Localização: ${loc.latitude}, ${loc.longitude}]`;
    }

    return {
        phone,
        messageId,
        isGroup: body.isGroup === true,
        isFromMe: body.isFromMe === true,
        messageType,
        content,
        imageUrl,
        audioUrl,
        videoUrl,
        documentUrl,
        senderName: body.senderName as string | undefined,
        timestamp: body.momment as number || Date.now(),
    };
}
