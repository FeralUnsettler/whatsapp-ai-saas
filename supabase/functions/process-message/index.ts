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
        const { conversationId, clientId, agentId } = payload;

        // Initialize clients
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;
        
        const supabase = createSupabaseClient(serviceRoleKey, supabaseUrl);

        if (!geminiApiKey) {
            throw new Error('Missing GEMINI_API_KEY');
        }

        const zapiConfig = getZAPIConfig();

        // Get conversation details
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            throw new Error('Conversation not found');
        }

        // Get agent configuration
        let agentConfig = null;
        if (agentId) {
            const { data: agent } = await supabase
                .from('agents')
                .select('*')
                .eq('id', agentId)
                .single();
            agentConfig = agent;
        } else {
            const { data: fallbackAgent } = await supabase
                .from('agents')
                .select('*')
                .eq('client_id', clientId)
                .eq('is_active', true)
                .limit(1)
                .single();
            agentConfig = fallbackAgent;
        }

        if (agentConfig && !agentConfig.is_active) {
            return new Response(JSON.stringify({ skipped: true, reason: 'agent_inactive' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!agentConfig) {
            return new Response(JSON.stringify({ skipped: true, reason: 'no_agent' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Get client configuration
        const { data: client } = await supabase
            .from('clients')
            .select('name, mcp_config')
            .eq('id', clientId)
            .single();

        // Get conversation history
        const history = await getConversationHistory(supabase, conversationId, 10);
        const lastMessage = history[history.length - 1];

        if (!lastMessage || !lastMessage.content) {
            return new Response(JSON.stringify({ skipped: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Check for escalation
        const escalationCheck = shouldEscalate(lastMessage.content, conversation.message_count);

        if (escalationCheck.escalate) {
            // Update conversation status
            await supabase
                .from('conversations')
                .update({ status: 'escalated' })
                .eq('id', conversationId);

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

            return new Response(JSON.stringify({ escalated: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Load MCP configuration
        const mcpConfig = loadMCPConfig(
            client?.mcp_config as Record<string, Record<string, string>>,
            { COMPANY_NAME: client?.name || 'Nossa empresa' }
        );

        // Build system prompt
        let systemPrompt = buildSystemPrompt(mcpConfig);
        if (agentConfig?.system_prompt) {
            systemPrompt = `${systemPrompt}\n\n---\n\n# Custom Instructions\n${agentConfig.system_prompt}`;
        }

        // Format conversation for Gemini
        const geminiHistory = formatConversationHistory(
            history.map((m: any) => ({
                direction: m.direction,
                content: m.content || '',
            }))
        );

        // Call Gemini API
        const aiResponse = await callGemini(systemPrompt, geminiHistory, {
            apiKey: geminiApiKey,
            model: agentConfig?.model || 'gemini-1.5-flash',
            temperature: agentConfig?.temperature || 0.7,
            maxOutputTokens: agentConfig?.max_tokens || 500,
        });

        // Send response via WhatsApp
        const sendResult = await sendTextMessage(conversation.customer_phone, aiResponse.text, zapiConfig);

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

        return new Response(
            JSON.stringify({
                success: true,
                response: aiResponse.text,
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
