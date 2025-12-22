import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using mock mode.')
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)

// Database types
export interface Client {
    id: string
    name: string
    slug: string
    email: string
    plan: 'free' | 'starter' | 'pro' | 'enterprise'
    status: 'active' | 'suspended' | 'cancelled'
    settings: Record<string, unknown>
    created_at: string
}

export interface User {
    id: string
    client_id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: 'owner' | 'admin' | 'member'
}

export interface Agent {
    id: string
    client_id: string
    name: string
    description: string | null
    is_active: boolean
    model: string
    temperature: number
    max_tokens: number
    system_prompt: string | null
}

export interface Conversation {
    id: string
    client_id: string
    customer_phone: string
    customer_name: string | null
    status: 'active' | 'escalated' | 'resolved' | 'archived'
    message_count: number
    last_message_at: string | null
    created_at: string
}

export interface Message {
    id: string
    conversation_id: string
    direction: 'inbound' | 'outbound'
    sender_type: 'customer' | 'agent' | 'human' | 'system'
    content: string | null
    message_type: string
    status: string
    created_at: string
}

export interface Lead {
    id: string
    client_id: string
    customer_phone: string
    customer_name: string | null
    email: string | null
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
    temperature: 'cold' | 'warm' | 'hot'
    score: number
    tags: string[]
    created_at: string
}
