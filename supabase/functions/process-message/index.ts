/**
 * Process Message Function
 * Loads MCP context, calls Gemini AI, and sends response
 */

import { createSupabaseClient, getConversationHistory, logBillingEvent } from '../_shared/supabase-client.ts';
import { loadMCPConfig, buildSystemPrompt, shouldEscalate } from '../_shared/mcp-loader.ts';
import { callGemini, formatConversationHistory } from '../_shared/gemini-client.ts';
import { sendTextMessage, getZAPIConfig } from '../_shared/zapi-client.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessMessagePayload {
    conversationId: string;
    messageId: string;
    clientId: string;
    agentId: string | null;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload: ProcessMessagePayload = await req.json();
        console.log('DEBUG: Received payload:', JSON.stringify(payload));
        const { conversationId, clientId, agentId } = payload;

        // Initialize clients
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;
        
        if (!geminiApiKey) {
            console.error('DEBUG: Missing GEMINI_API_KEY');
            throw new Error('Missing GEMINI_API_KEY');
        }

        const zapiConfig = getZAPIConfig();
        console.log('DEBUG: Z-API Config:', zapiConfig.instanceId);

        const supabase = createSupabaseClient(serviceRoleKey, supabaseUrl);

        // Get conversation details
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            console.error('DEBUG: Conversation not found:', convError);
            throw new Error('Conversation not found');
        }

        console.log('DEBUG: Processing conversation for customer:', conversation.customer_phone);

        // Get agent configuration
        let agentConfig = null;
        if (agentId) {
            const { data: agent, error: agentError } = await supabase
                .from('agents')
                .select('*')
                .eq('id', agentId)
                .single();
            
            if (agentError) {
                console.error('DEBUG: Error fetching agent:', agentError);
            }
            
            agentConfig = agent;
            console.log('DEBUG: Agent found:', agent?.name, '| is_active:', agent?.is_active);
        } else {
            // Fallback: Try to find an active agent for this client
            console.log('DEBUG: No agentId provided, searching for active agent for client:', clientId);
            const { data: fallbackAgent, error: fallbackError } = await supabase
                .from('agents')
                .select('*')
                .eq('client_id', clientId)
                .eq('is_active', true)
                .limit(1)
                .single();
            
            if (fallbackError) {
                console.log('DEBUG: No fallback agent found:', fallbackError.message);
            } else {
                agentConfig = fallbackAgent;
                console.log('DEBUG: Fallback agent found:', fallbackAgent?.name);
            }
        }

        // Check if agent is active
        if (agentConfig && !agentConfig.is_active) {
            console.log('DEBUG: Agent is not active, skipping AI response');
            return new Response(JSON.stringify({ skipped: true, reason: 'agent_inactive' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // If no active agent found at all, skip processing
        if (!agentConfig) {
            console.log('DEBUG: No active agent configured for this client, skipping AI response');
            return new Response(JSON.stringify({ skipped: true, reason: 'no_agent' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log('DEBUG: Processing with agent:', agentConfig.name, '| model:', agentConfig.model);

        // Get client configuration
        const { data: client } = await supabase
            .from('clients')
            .select('name, mcp_config')
            .eq('id', clientId)
            .single();
        console.log('DEBUG: Client found:', client?.name);

        // Get conversation history
        const history = await getConversationHistory(supabase, conversationId, 10);
        console.log('DEBUG: History length:', history.length);
        const lastMessage = history[history.length - 1];

        if (!lastMessage || !lastMessage.content) {
            console.log('DEBUG: Skipping (no content in last message)');
            return new Response(JSON.stringify({ skipped: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log('DEBUG: Last message content:', lastMessage.content);

        // Check for escalation
        const escalationCheck = shouldEscalate(lastMessage.content, conversation.message_count);

        if (escalationCheck.escalate) {
            console.log('DEBUG: Escalating:', escalationCheck.reason);
            // Update conversation status
            await supabase
                .from('conversations')
                .update({ status: 'escalated' })
                .eq('id', conversationId);
            
            // If it was already escalated, don't repeat the message
            if (conversation.status === 'escalated') {
                return new Response(JSON.stringify({ skipped: true, reason: 'already_escalated' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Send escalation message
            const escalationMsg = 'Entendi! Vou transferir você para nossa equipe de atendimento. Aguarde um momento, por favor. 🙏';

            await sendTextMessage(conversation.customer_phone, escalationMsg, zapiConfig);

            // Store outbound message
            await supabase.from('messages').insert({
                conversation_id: conversationId,
                client_id: clientId,
                direction: 'outbound',
                sender_type: 'system',
                content: escalationMsg,
                message_type: 'text',
                status: 'sent',
                ai_metadata: { escalation: true, reason: escalationCheck.reason },
            });

            // Trigger n8n webhook for escalation notification
            const n8nUrl = Deno.env.get('N8N_WEBHOOK_URL');
            if (n8nUrl) {
                await fetch(`${n8nUrl}/escalation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversationId,
                        clientId,
                        customerPhone: conversation.customer_phone,
                        customerName: conversation.customer_name,
                        reason: escalationCheck.reason,
                    }),
                }).catch(console.error);
            }

            return new Response(JSON.stringify({ escalated: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // If conversation was escalated but user is talking again with non-escalating keywords,
        // move it back to active so the bot keeps responding.
        if (conversation.status === 'escalated') {
            console.log('DEBUG: Moving conversation back to active');
            await supabase
                .from('conversations')
                .update({ status: 'active' })
                .eq('id', conversationId);
        }

        // Increment message count
        await supabase
            .from('conversations')
            .update({ message_count: (conversation.message_count || 0) + 1 })
            .eq('id', conversationId);

        // Load MCP configuration
        const mcpConfig = loadMCPConfig(
            client?.mcp_config as Record<string, Record<string, string>>,
            { COMPANY_NAME: client?.name || 'Nossa empresa' }
        );

        // Build system prompt
        let systemPrompt = buildSystemPrompt(mcpConfig);

        // Add agent custom prompt if available
        if (agentConfig?.system_prompt) {
            systemPrompt = `${systemPrompt}\n\n---\n\n# Custom Instructions\n${agentConfig.system_prompt}`;
        }

        // Format conversation for Gemini
        const geminiHistory = formatConversationHistory(
            history.map((m) => ({
                direction: m.direction,
                content: m.content || '',
            }))
        );

        // Call Gemini API
        console.log('DEBUG: Calling Gemini API with system prompt length:', systemPrompt.length);
        console.log('DEBUG: Gemini History:', JSON.stringify(geminiHistory));
        
        const aiResponse = await callGemini(systemPrompt, geminiHistory, {
            apiKey: geminiApiKey,
            model: agentConfig?.model || 'gemini-2.0-flash',
            temperature: agentConfig?.temperature || 0.7,
            maxOutputTokens: agentConfig?.max_tokens || 500,
        });
        
        console.log('DEBUG: Gemini AI Success. Text length:', aiResponse.text.length);

        // Send response via WhatsApp
        console.log('DEBUG: Sending WhatsApp response to:', conversation.customer_phone);
        const sendResult = await sendTextMessage(conversation.customer_phone, aiResponse.text, zapiConfig);
        console.log('DEBUG: Z-API Send Result:', JSON.stringify(sendResult));

        // Store AI response
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            client_id: clientId,
            direction: 'outbound',
            sender_type: 'agent',
            content: aiResponse.text,
            message_type: 'text',
            whatsapp_message_id: sendResult.messageId,
            status: sendResult.success ? 'sent' : 'failed',
            ai_metadata: {
                model: agentConfig?.model || 'gemini-1.5-flash',
                tokens: aiResponse.tokens,
            },
        });

        // Log billing events
        await logBillingEvent(supabase, clientId, 'ai_call', {
            tokens: aiResponse.tokens,
            model: agentConfig?.model || 'gemini-1.5-flash',
        });

        await logBillingEvent(supabase, clientId, 'message_sent', {
            message_id: sendResult.messageId,
        });

        // Auto-create lead if new conversation
        if (conversation.message_count <= 1) {
            const { data: existingLead } = await supabase
                .from('leads')
                .select('id')
                .eq('client_id', clientId)
                .eq('customer_phone', conversation.customer_phone)
                .single();

            if (!existingLead) {
                const { data: newLead } = await supabase
                    .from('leads')
                    .insert({
                        client_id: clientId,
                        customer_phone: conversation.customer_phone,
                        customer_name: conversation.customer_name,
                        conversation_id: conversationId,
                        status: 'new',
                        temperature: 'warm',
                    })
                    .select()
                    .single();

                // Trigger n8n new lead webhook
                const n8nUrl = Deno.env.get('N8N_WEBHOOK_URL');
                if (n8nUrl && newLead) {
                    await fetch(`${n8nUrl}/new-lead`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            leadId: newLead.id,
                            clientId,
                            customerPhone: conversation.customer_phone,
                            customerName: conversation.customer_name,
                        }),
                    }).catch(console.error);
                }
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                response: aiResponse.text,
                tokens: aiResponse.tokens,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Process message error:', error);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
