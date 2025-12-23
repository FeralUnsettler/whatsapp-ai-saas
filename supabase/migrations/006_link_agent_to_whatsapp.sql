-- =====================================================
-- Link Agent to WhatsApp Number
-- =====================================================

DO $$
DECLARE
    user_email TEXT := 'bananamachinada@gmail.com';
    zapi_instance_id TEXT := '3EC0A5B1CAB792621F6682BF222E0CD5';
    target_client_id UUID;
    target_agent_id UUID;
BEGIN
    -- 1. Find the client_id for the user
    SELECT client_id INTO target_client_id
    FROM public.users
    WHERE email = user_email
    LIMIT 1;

    IF target_client_id IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;

    RAISE NOTICE 'Found client_id: %', target_client_id;

    -- 2. Find or create an active agent for this client
    SELECT id INTO target_agent_id
    FROM public.agents
    WHERE client_id = target_client_id
    AND is_active = true
    LIMIT 1;

    IF target_agent_id IS NULL THEN
        -- Create a default agent
        INSERT INTO public.agents (
            client_id,
            name,
            description,
            is_active,
            model,
            temperature,
            max_tokens,
            system_prompt
        ) VALUES (
            target_client_id,
            'Agente Principal',
            'Agente de atendimento automatizado',
            true,
            'gemini-2.0-flash-exp',
            0.7,
            500,
            'Você é um assistente prestativo e amigável.'
        )
        RETURNING id INTO target_agent_id;
        
        RAISE NOTICE 'Created new agent: %', target_agent_id;
    ELSE
        RAISE NOTICE 'Found existing agent: %', target_agent_id;
    END IF;

    -- 3. Update WhatsApp number to link to agent
    UPDATE public.whatsapp_numbers
    SET agent_id = target_agent_id
    WHERE phone_number_id = zapi_instance_id;

    IF NOT FOUND THEN
        -- Insert if not exists
        INSERT INTO public.whatsapp_numbers (
            client_id,
            agent_id,
            phone_number_id,
            display_number,
            status,
            verified
        ) VALUES (
            target_client_id,
            target_agent_id,
            zapi_instance_id,
            '5551989663750',
            'active',
            true
        );
        RAISE NOTICE 'Created wwatsapp_number with agent link';
    ELSE
        RAISE NOTICE 'Updated whatsapp_number with agent_id: %', target_agent_id;
    END IF;

END $$;

-- Verify the link
SELECT 
    wn.id as whatsapp_number_id,
    wn.phone_number_id as zapi_instance,
    wn.display_number,
    wn.agent_id,
    a.name as agent_name,
    a.is_active as agent_is_active,
    a.model as agent_model,
    c.name as client_name
FROM public.whatsapp_numbers wn
LEFT JOIN public.agents a ON a.id = wn.agent_id
LEFT JOIN public.clients c ON c.id = wn.client_id
WHERE wn.phone_number_id = '3EC0A5B1CAB792621F6682BF222E0CD5';
