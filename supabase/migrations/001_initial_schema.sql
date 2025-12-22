-- =====================================================
-- WhatsApp AI SaaS - Initial Database Schema
-- Multi-tenant with Row Level Security (RLS)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Clients (Tenants) - The companies using our SaaS
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    settings JSONB DEFAULT '{}',
    mcp_config JSONB DEFAULT '{}', -- Stores custom MCP overrides
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users - People who can access the dashboard
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents - AI agent configurations per client
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    model VARCHAR(100) DEFAULT 'gemini-1.5-pro',
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 500,
    system_prompt TEXT,
    mcp_overrides JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Numbers - Connected phone numbers
CREATE TABLE public.whatsapp_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    phone_number_id VARCHAR(100) NOT NULL, -- WhatsApp Cloud API ID
    display_number VARCHAR(50) NOT NULL,
    verified BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disconnected')),
    webhook_secret VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(phone_number_id)
);

-- Conversations - Chat sessions with customers
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    whatsapp_number_id UUID REFERENCES public.whatsapp_numbers(id) ON DELETE SET NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    customer_profile_pic TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'escalated', 'resolved', 'archived')),
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    lead_id UUID, -- Set later when linked to a lead
    last_message_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages - Individual messages in conversations
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'agent', 'human', 'system')),
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'location', 'sticker')),
    media_url TEXT,
    whatsapp_message_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    ai_metadata JSONB DEFAULT '{}', -- Stores AI decision context
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads - Potential customers captured from conversations
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    email VARCHAR(255),
    source VARCHAR(50) DEFAULT 'whatsapp',
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    temperature VARCHAR(20) DEFAULT 'warm' CHECK (temperature IN ('cold', 'warm', 'hot')),
    score INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    last_contact_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update conversation with lead reference
ALTER TABLE public.conversations 
ADD CONSTRAINT fk_conversations_lead 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

-- Billing Events - Usage and payment tracking
CREATE TABLE public.billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'message_sent', 'message_received', 'ai_call', 
        'subscription_created', 'subscription_updated', 'subscription_cancelled',
        'payment_succeeded', 'payment_failed', 'invoice_created'
    )),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 4) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'BRL',
    stripe_event_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_client_id ON public.users(client_id);
CREATE INDEX idx_agents_client_id ON public.agents(client_id);
CREATE INDEX idx_whatsapp_numbers_client_id ON public.whatsapp_numbers(client_id);
CREATE INDEX idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX idx_conversations_customer_phone ON public.conversations(customer_phone);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_leads_client_id ON public.leads(client_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_billing_events_client_id ON public.billing_events(client_id);
CREATE INDEX idx_billing_events_created_at ON public.billing_events(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's client_id from JWT
CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS UUID AS $$
    SELECT client_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Clients: Users can only see their own client
CREATE POLICY "Users can view own client" ON public.clients
    FOR SELECT USING (id = public.get_user_client_id());

CREATE POLICY "Owners can update own client" ON public.clients
    FOR UPDATE USING (
        id = public.get_user_client_id() 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Users: Can see users from same client
CREATE POLICY "Users can view team members" ON public.users
    FOR SELECT USING (client_id = public.get_user_client_id());

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage team" ON public.users
    FOR ALL USING (
        client_id = public.get_user_client_id()
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Agents: Tenant isolation
CREATE POLICY "Tenant isolation for agents" ON public.agents
    FOR ALL USING (client_id = public.get_user_client_id());

-- WhatsApp Numbers: Tenant isolation
CREATE POLICY "Tenant isolation for whatsapp_numbers" ON public.whatsapp_numbers
    FOR ALL USING (client_id = public.get_user_client_id());

-- Conversations: Tenant isolation
CREATE POLICY "Tenant isolation for conversations" ON public.conversations
    FOR ALL USING (client_id = public.get_user_client_id());

-- Messages: Tenant isolation
CREATE POLICY "Tenant isolation for messages" ON public.messages
    FOR ALL USING (client_id = public.get_user_client_id());

-- Leads: Tenant isolation
CREATE POLICY "Tenant isolation for leads" ON public.leads
    FOR ALL USING (client_id = public.get_user_client_id());

-- Billing: Tenant isolation (read only for non-admins)
CREATE POLICY "Tenant isolation for billing" ON public.billing_events
    FOR SELECT USING (client_id = public.get_user_client_id());

CREATE POLICY "Admins can insert billing" ON public.billing_events
    FOR INSERT WITH CHECK (
        client_id = public.get_user_client_id()
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- =====================================================
-- SERVICE ROLE POLICIES (for Edge Functions)
-- =====================================================

-- Allow service role to bypass RLS for webhook processing
CREATE POLICY "Service role full access to clients" ON public.clients
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to conversations" ON public.conversations
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to messages" ON public.messages
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to leads" ON public.leads
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to billing" ON public.billing_events
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_numbers_updated_at
    BEFORE UPDATE ON public.whatsapp_numbers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Increment message count on conversation
CREATE OR REPLACE FUNCTION public.increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET 
        message_count = message_count + 1,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_conversation_message_count
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.increment_message_count();
