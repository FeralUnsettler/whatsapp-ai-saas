/**
 * Send WhatsApp Message Function
 * API endpoint for sending messages from the dashboard
 */

import { createSupabaseClient, logBillingEvent } from '../_shared/supabase-client.ts';
import { sendTextMessage } from '../_shared/whatsapp-client.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessagePayload {
    conversationId: string;
    content: string;
    senderType?: 'human' | 'system';
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Verify authorization
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const payload: SendMessagePayload = await req.json();
        const { conversationId, content, senderType = 'human' } = payload;

        if (!conversationId || !content) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Initialize clients
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const waPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')!;
        const waAccessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')!;

        const supabase = createSupabaseClient(serviceRoleKey, supabaseUrl);

        // Get conversation
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('id, client_id, customer_phone')
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Send via WhatsApp
        const sendResult = await sendTextMessage(conversation.customer_phone, content, {
            phoneNumberId: waPhoneNumberId,
            accessToken: waAccessToken,
        });

        if (!sendResult.success) {
            return new Response(JSON.stringify({ error: sendResult.error }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Store message
        const { data: message, error: msgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                client_id: conversation.client_id,
                direction: 'outbound',
                sender_type: senderType,
                content,
                message_type: 'text',
                whatsapp_message_id: sendResult.messageId,
                status: 'sent',
            })
            .select()
            .single();

        if (msgError) {
            console.error('Failed to store message:', msgError);
        }

        // Log billing
        await logBillingEvent(supabase, conversation.client_id, 'message_sent', {
            message_id: sendResult.messageId,
            sender_type: senderType,
        });

        return new Response(
            JSON.stringify({
                success: true,
                messageId: sendResult.messageId,
                message,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Send message error:', error);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
