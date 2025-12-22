import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { getZAPIConfig, getInstanceStatus } from '../_shared/zapi-client.ts'

console.log('Hello from Functions!')

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('DEBUG: Fetching Z-API config...');
        const config = getZAPIConfig();
        console.log('DEBUG: Checking status for instance:', config.instanceId);
        
        const status = await getInstanceStatus(config);
        console.log('DEBUG: Z-API status response:', JSON.stringify(status));

        return new Response(JSON.stringify(status), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('DEBUG: get-zapi-status error:', {
            message: (error as Error).message,
            stack: (error as Error).stack,
            error
        });
        return new Response(JSON.stringify({ 
            error: (error as Error).message,
            details: 'Check if ZAPI_INSTANCE_ID and ZAPI_TOKEN are correct in Supabase Secrets.'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Return 200 so UI can show the error message
        });
    }
})
