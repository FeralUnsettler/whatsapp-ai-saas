
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

const env = await load();
const supabaseUrl = env["SUPABASE_URL"] || Deno.env.get("SUPABASE_URL");
const supabaseKey = env["SUPABASE_SERVICE_ROLE_KEY"] || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables");
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("--- AGENTS ---");
    const { data: agents } = await supabase.from('agents').select('id, name, is_active, client_id, model');
    console.log(agents);

    console.log("\n--- WHATSAPP NUMBERS ---");
    const { data: numbers } = await supabase.from('whatsapp_numbers').select('id, phone_number_id, agent_id, client_id');
    console.log(numbers);

    console.log("\n--- RECENT MESSAGES ---");
    const { data: messages } = await supabase
        .from('messages')
        .select('content, direction, created_at, sender_type')
        .order('created_at', { ascending: false })
        .limit(10);
    console.log(messages);

    console.log("\n--- LATEST CONVERSATION ---");
    const { data: conversations } = await supabase
        .from('conversations')
        .select('id, status, message_count, customer_phone')
        .order('created_at', { ascending: false })
        .limit(1);
    console.log(conversations);
}

inspect();
