-- =====================================================
-- FIX: Manually Sync Auth User to Public User
-- =====================================================

DO $$
DECLARE
    target_auth_id UUID;
    target_email TEXT := 'bananamachinada@gmail.com';
    new_client_id UUID;
BEGIN
    -- 1. Get the Auth User ID directly from auth.users
    SELECT id INTO target_auth_id
    FROM auth.users
    WHERE email = target_email
    LIMIT 1;

    IF target_auth_id IS NULL THEN
        RAISE EXCEPTION 'Auth user not found. Did you sign up correctly?';
    END IF;

    -- 2. Check if public.users record exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = target_auth_id) THEN
        
        -- Create Client
        INSERT INTO public.clients (name, email, slug)
        VALUES ('PalhetaDigital', target_email, 'palhetadigital-' || substring(md5(random()::text) from 1 for 4))
        RETURNING id INTO new_client_id;

        -- Create Public User
        INSERT INTO public.users (id, client_id, email, full_name, role)
        VALUES (target_auth_id, new_client_id, target_email, 'Luciano', 'owner');
        
        RAISE NOTICE 'Fixed: Created public user and client for %', target_email;
    ELSE
        RAISE NOTICE 'User already exists in public schema.';
    END IF;

    -- 3. Now Link WhatsApp
    INSERT INTO public.whatsapp_numbers (client_id, phone_number_id, display_number, status, verified)
    VALUES (
        (SELECT client_id FROM public.users WHERE id = target_auth_id), 
        '3EC0A5B1CAB792621F6682BF222E0CD5', 
        '5551989663750', 
        'active', 
        true
    )
    ON CONFLICT (phone_number_id) DO UPDATE SET status = 'active';

END $$;
