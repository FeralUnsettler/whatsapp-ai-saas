
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

const env = await load();
const supabaseUrl = env["SUPABASE_URL"] || Deno.env.get("SUPABASE_URL");
const supabaseKey = env["SUPABASE_SERVICE_ROLE_KEY"] || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConversation() {
    const { data: convs, error } = await supabase
        .from('conversations')
        .select('id, customer_phone, message_count, status')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching conversations:', error);
        return;
    }

    console.log('Recent Conversations:');
    convs.forEach(c => {
        console.log(`Phone: ${c.customer_phone} | Status: ${c.status} | Count: ${c.message_count} | ID: ${c.id}`);
    });
}

checkConversation();
