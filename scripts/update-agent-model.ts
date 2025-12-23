
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

const env = await load();
const supabaseUrl = env["SUPABASE_URL"] || Deno.env.get("SUPABASE_URL");
const supabaseKey = env["SUPABASE_SERVICE_ROLE_KEY"] || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase
  .from('agents')
  .update({ model: 'gemini-2.0-flash' })
  .eq('id', '6bf18e62-07f3-44e9-8269-f17c716b048c')
  .select();

if (error) {
  console.error('Error updating agent:', error);
  Deno.exit(1);
}

console.log('Agent updated successfully:', data);
