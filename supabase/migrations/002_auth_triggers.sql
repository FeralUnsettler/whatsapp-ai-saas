-- =====================================================
-- Auto-create Client and User on Signup
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_client_id UUID;
    full_name TEXT;
    company_name TEXT;
BEGIN
    -- Extract metadata
    full_name := new.raw_user_meta_data->>'full_name';
    company_name := new.raw_user_meta_data->>'company_name';

    -- Default company name if missing
    IF company_name IS NULL OR company_name = '' THEN
        company_name := 'Minha Empresa';
    END IF;

    -- 1. Create a new Client (Tenant)
    INSERT INTO public.clients (name, email, slug)
    VALUES (
        company_name, 
        new.email, 
        lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(md5(random()::text) from 1 for 4)
    )
    RETURNING id INTO new_client_id;

    -- 2. Create the User Profile linked to the Client
    INSERT INTO public.users (id, client_id, email, full_name, role)
    VALUES (
        new.id,
        new_client_id,
        new.email,
        full_name,
        'owner'
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
