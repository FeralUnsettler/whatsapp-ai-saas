-- Table for leads captured directly from the SaaS landing page
CREATE TABLE IF NOT EXISTS public.platform_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.platform_leads ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for landing page)
CREATE POLICY "Anyone can submit a lead" ON public.platform_leads
    FOR INSERT WITH CHECK (true);

-- Allow admins to view
CREATE POLICY "Admins can view platform leads" ON public.platform_leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
