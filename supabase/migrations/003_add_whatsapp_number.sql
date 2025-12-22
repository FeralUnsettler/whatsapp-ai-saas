-- =====================================================
-- Link Z-API Instance to User Account
-- =====================================================

DO $$
DECLARE
    user_email TEXT := 'bananamachinada@gmail.com'; -- Seu email
    zapi_instance_id TEXT := '3EC0A5B1CAB792621F6682BF222E0CD5'; -- Seu ID da Z-API
    target_client_id UUID;
BEGIN
    -- 1. Find the client_id for the user
    SELECT client_id INTO target_client_id
    FROM public.users
    WHERE email = user_email
    LIMIT 1;

    IF target_client_id IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;

    -- 2. Insert or Update the WhatsApp Number record
    INSERT INTO public.whatsapp_numbers (
        client_id,
        phone_number_id,
        display_number,
        status,
        verified
    ) VALUES (
        target_client_id,
        zapi_instance_id,
        '5551989663750', -- Seu número de exibição
        'active',
        true
    )
    ON CONFLICT (phone_number_id) 
    DO UPDATE SET 
        client_id = EXCLUDED.client_id,
        status = 'active',
        verified = true;

    RAISE NOTICE 'WhatsApp number linked successfully to client %', target_client_id;
END $$;
