
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

const env = await load();
const supabaseUrl = env["SUPABASE_URL"] || Deno.env.get("SUPABASE_URL");
const supabaseKey = env["SUPABASE_SERVICE_ROLE_KEY"] || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
    const { data: agents } = await supabase.from('agents').select('name, is_active, model');
    console.log('Agents:', agents);

    const { data: convs } = await supabase
        .from('conversations')
        .select('customer_phone, status, message_count')
        .order('created_at', { ascending: false })
        .limit(1);
    console.log('Latest Conversation:', convs);
}

checkStatus();
