/**
 * WhatsApp Cloud API Client
 * Handles sending messages via WhatsApp Business Cloud API
 */

interface WhatsAppConfig {
    phoneNumberId: string;
    accessToken: string;
}

interface SendMessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_BASE_URL = 'https://graph.facebook.com';

/**
 * Send a text message via WhatsApp Cloud API
 */
export async function sendTextMessage(
    to: string,
    text: string,
    config: WhatsAppConfig
): Promise<SendMessageResult> {
    const url = `${WHATSAPP_BASE_URL}/${WHATSAPP_API_VERSION}/${config.phoneNumberId}/messages`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to.replace(/\D/g, ''), // Clean phone number
                type: 'text',
                text: { body: text },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error?.message || `HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            messageId: data.messages?.[0]?.id,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Send a template message via WhatsApp Cloud API
 */
export async function sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components: unknown[],
    config: WhatsAppConfig
): Promise<SendMessageResult> {
    const url = `${WHATSAPP_BASE_URL}/${WHATSAPP_API_VERSION}/${config.phoneNumberId}/messages`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to.replace(/\D/g, ''),
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: languageCode },
                    components,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error?.message || `HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            messageId: data.messages?.[0]?.id,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Mark a message as read
 */
export async function markAsRead(
    messageId: string,
    config: WhatsAppConfig
): Promise<void> {
    const url = `${WHATSAPP_BASE_URL}/${WHATSAPP_API_VERSION}/${config.phoneNumberId}/messages`;

    await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        }),
    });
}

/**
 * Download media from WhatsApp
 */
export async function downloadMedia(
    mediaId: string,
    config: WhatsAppConfig
): Promise<{ data: ArrayBuffer; mimeType: string } | null> {
    // First, get the media URL
    const metaUrl = `${WHATSAPP_BASE_URL}/${WHATSAPP_API_VERSION}/${mediaId}`;

    try {
        const metaResponse = await fetch(metaUrl, {
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
            },
        });

        if (!metaResponse.ok) return null;

        const meta = await metaResponse.json();

        // Then download the actual media
        const mediaResponse = await fetch(meta.url, {
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
            },
        });

        if (!mediaResponse.ok) return null;

        const data = await mediaResponse.arrayBuffer();
        const mimeType = meta.mime_type;

        return { data, mimeType };
    } catch {
        return null;
    }
}
