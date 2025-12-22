/**
 * Supabase Database Client
 * Shared database utilities for Edge Functions
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type Database = {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    email: string;
                    plan: string;
                    status: string;
                    mcp_config: Record<string, unknown>;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    email: string;
                    plan?: string;
                    status?: string;
                    mcp_config?: Record<string, unknown>;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    email?: string;
                    plan?: string;
                    status?: string;
                    mcp_config?: Record<string, unknown>;
                };
                Relationships: [];
            };
            agents: {
                Row: {
                    id: string;
                    client_id: string;
                    name: string;
                    is_active: boolean;
                    model: string;
                    temperature: number;
                    max_tokens: number;
                    system_prompt: string | null;
                    mcp_overrides: Record<string, unknown>;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    name: string;
                    is_active?: boolean;
                    model: string;
                    temperature?: number;
                    max_tokens?: number;
                    system_prompt?: string | null;
                    mcp_overrides?: Record<string, unknown>;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    name?: string;
                    is_active?: boolean;
                    model?: string;
                    temperature?: number;
                    max_tokens?: number;
                    system_prompt?: string | null;
                    mcp_overrides?: Record<string, unknown>;
                };
                Relationships: [];
            };
            whatsapp_numbers: {
                Row: {
                    id: string;
                    client_id: string;
                    agent_id: string | null;
                    phone_number_id: string;
                    display_number: string;
                    status: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    agent_id?: string | null;
                    phone_number_id: string;
                    display_number: string;
                    status?: string;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    agent_id?: string | null;
                    phone_number_id?: string;
                    display_number?: string;
                    status?: string;
                };
                Relationships: [];
            };
            conversations: {
                Row: {
                    id: string;
                    client_id: string;
                    whatsapp_number_id: string | null;
                    customer_phone: string;
                    customer_name: string | null;
                    status: string;
                    message_count: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    whatsapp_number_id?: string | null;
                    customer_phone: string;
                    customer_name?: string | null;
                    status?: string;
                    message_count?: number;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    whatsapp_number_id?: string | null;
                    customer_phone?: string;
                    customer_name?: string | null;
                    status?: string;
                    message_count?: number;
                };
                Relationships: [];
            };
            messages: {
                Row: {
                    id: string;
                    conversation_id: string;
                    client_id: string;
                    direction: 'inbound' | 'outbound';
                    sender_type: string;
                    content: string | null;
                    message_type: string;
                    whatsapp_message_id: string | null;
                    status: string;
                    created_at: string;
                    ai_metadata?: Record<string, unknown>;
                };
                Insert: {
                    id?: string;
                    conversation_id: string;
                    client_id: string;
                    direction: 'inbound' | 'outbound';
                    sender_type: string;
                    content?: string | null;
                    message_type?: string;
                    whatsapp_message_id?: string | null;
                    status?: string;
                    ai_metadata?: Record<string, unknown>;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    conversation_id?: string;
                    client_id?: string;
                    direction?: 'inbound' | 'outbound';
                    sender_type?: string;
                    content?: string | null;
                    message_type?: string;
                    whatsapp_message_id?: string | null;
                    status?: string;
                    ai_metadata?: Record<string, unknown>;
                    created_at?: string;
                };
                Relationships: [];
            };
            leads: {
                Row: {
                    id: string;
                    client_id: string;
                    customer_phone: string;
                    customer_name: string | null;
                    status: string;
                    temperature: string;
                    score: number;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    customer_phone: string;
                    customer_name?: string | null;
                    status?: string;
                    temperature?: string;
                    score?: number;
                    conversation_id?: string | null;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    customer_phone?: string;
                    customer_name?: string | null;
                    status?: string;
                    temperature?: string;
                    score?: number;
                    conversation_id?: string | null;
                };
                Relationships: [];
            };
            billing_events: {
                Row: {
                    id: string;
                    client_id: string;
                    event_type: string;
                    quantity: number;
                    metadata: Record<string, unknown> | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    event_type: string;
                    quantity?: number;
                    metadata?: Record<string, unknown> | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    event_type?: string;
                    quantity?: number;
                    metadata?: Record<string, unknown> | null;
                    created_at?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

export function createSupabaseClient(serviceRoleKey: string, supabaseUrl: string): SupabaseClient<Database> {
    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Find or create a conversation for a phone number
 */
export async function findOrCreateConversation(
    supabase: SupabaseClient<Database>,
    clientId: string,
    customerPhone: string,
    whatsappNumberId: string,
    customerName?: string
) {
    // Try to find existing active conversation
    const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', clientId)
        .eq('customer_phone', customerPhone)
        .in('status', ['active', 'escalated'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (existing) {
        return existing;
    }

    // Create new conversation
    const { data: created, error } = await supabase
        .from('conversations')
        .insert({
            client_id: clientId,
            whatsapp_number_id: whatsappNumberId,
            customer_phone: customerPhone,
            customer_name: customerName ?? null,
            status: 'active',
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return created;
}

/**
 * Get recent messages from a conversation for context
 */
export async function getConversationHistory(
    supabase: SupabaseClient<Database>,
    conversationId: string,
    limit = 10
) {
    const { data: messages } = await supabase
        .from('messages')
        .select('direction, content, sender_type, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

    return messages || [];
}

/**
 * Log a billing event
 */
export async function logBillingEvent(
    supabase: SupabaseClient<Database>,
    clientId: string,
    eventType: string,
    metadata?: Record<string, unknown>
) {
    await supabase.from('billing_events').insert({
        client_id: clientId,
        event_type: eventType,
        quantity: 1,
        metadata,
    });
}
