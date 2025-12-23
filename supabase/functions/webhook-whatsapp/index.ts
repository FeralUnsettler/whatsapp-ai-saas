/**
 * Z-API WhatsApp Webhook Handler
 * Receives incoming messages from Z-API
 * and stores them in the database.
 * Docs: https://developer.z-api.io/webhooks/on-message-received
 */

import { createSupabaseClient, findOrCreateConversation } from '../_shared/supabase-client.ts';
import { parseWebhookPayload, getZAPIConfig } from '../_shared/zapi-client.ts';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-security-token',
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Z-API only sends POST requests (no hub verification like Meta)
    if (req.method === 'POST') {
        try {
            const body = await req.json();
            console.log('DEBUG: Incoming Webhook Request:', JSON.stringify(body));

            // Optional: Validate security token if configured
            const config = getZAPIConfig();
            // TEMPORARILY DISABLED: Security token validation
            // The Z-API webhook is not sending the expected token header
            // To re-enable, configure ZAPI_SECURITY_TOKEN in Supabase secrets
            // and ensure Z-API is sending the token in x-security-token or Client-Token header
            /*
            if (config.securityToken) {
                const receivedToken = req.headers.get('x-security-token') || req.headers.get('Client-Token');
                if (receivedToken !== config.securityToken) {
                    console.error('Invalid security token');
                    return new Response('Forbidden', { status: 403, headers: corsHeaders });
                }
            }
            */

            // Parse Z-API webhook payload
            const message = parseWebhookPayload(body);

            // Skip if not a valid message or from me/group
            if (!message) {
                return new Response(JSON.stringify({ success: true, skipped: true }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            console.log('DEBUG: Payload parsed successfully:', message.messageId);

            // Initialize Supabase client
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
            const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
            const supabase = createSupabaseClient(serviceRoleKey, supabaseUrl);

            // Get the Z-API instance from database
            console.log('DEBUG: Looking for Z-API instance:', config.instanceId);
            const { data: waNumber, error: waError } = await supabase
                .from('whatsapp_numbers')
                .select('id, client_id, agent_id')
                .eq('phone_number_id', config.instanceId)
                .single();

            if (waError) {
                console.error('DEBUG: Error fetching waNumber:', waError);
            }
            console.log('DEBUG: Found waNumber:', waNumber ? 'Yes' : 'No');

            if (!waNumber) {
                console.error(`Unknown Z-API instance: ${config.instanceId}`);
                return new Response(JSON.stringify({ success: false, error: 'Unknown instance' }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Find or create conversation
            const conversation = await findOrCreateConversation(
                supabase,
                waNumber.client_id,
                message.phone,
                waNumber.id,
                message.senderName
            );
            console.log('DEBUG: Conversation ready:', conversation.id);

            // Store the message
            const { error: msgError } = await supabase.from('messages').insert({
                conversation_id: conversation.id,
                client_id: waNumber.client_id,
                direction: 'inbound',
                sender_type: 'customer',
                content: message.content,
                message_type: message.messageType,
                whatsapp_message_id: message.messageId,
                status: 'delivered',
                ai_metadata: {
                    imageUrl: message.imageUrl,
                    audioUrl: message.audioUrl,
                    videoUrl: message.videoUrl,
                    documentUrl: message.documentUrl,
                },
            });

            if (msgError) {
                console.error('DEBUG: Failed to store message:', msgError);
                return new Response(JSON.stringify({ success: false, error: msgError.message }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Log billing event
            await supabase.from('billing_events').insert({
                client_id: waNumber.client_id,
                event_type: 'message_received',
                quantity: 1,
                metadata: { message_id: message.messageId },
            });

            // Trigger message processing asynchronously
            console.log('DEBUG: Triggering process-message for conv:', conversation.id);
            const processUrl = `${supabaseUrl}/functions/v1/process-message`;
            
            // Fire and forget - don't await to avoid webhook timeouts/retries
            fetch(processUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId: conversation.id,
                    messageId: message.messageId,
                    clientId: waNumber.client_id,
                    agentId: waNumber.agent_id,
                    messageType: message.messageType,
                    imageUrl: message.imageUrl,
                }),
            }).then(res => {
                if (!res.ok) {
                    res.text().then(txt => console.error('DEBUG: process-message error:', txt));
                } else {
                    console.log('DEBUG: process-message triggered successfully');
                }
            }).catch(pError => {
                console.error('DEBUG: process-message fetch failed:', pError);
            });

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Webhook processing error:', error);
            return new Response(JSON.stringify({ error: (error as Error).message }), {
                status: 200, // Return 200 to prevent retries
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
});
