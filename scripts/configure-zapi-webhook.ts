
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
await load({ export: true });

// Set your credentials here if .env fails
const INSTANCE_ID = Deno.env.get("ZAPI_INSTANCE_ID") || "3EC0A5B1CAB792621F6682BF222E0CD5";
const TOKEN = Deno.env.get("ZAPI_TOKEN") || "611FA31F38FEAAB876385B01";
const SECURITY_TOKEN = Deno.env.get("ZAPI_SECURITY_TOKEN") || "F19b9c7d061384d18aec4abe7213f5ba0S";
const SUPABASE_WEBHOOK_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhook-whatsapp` || "https://hlanxgeuqmkmimzgbswn.supabase.co/functions/v1/webhook-whatsapp";

async function configureWebhooks() {
    console.log("Configuring Webhooks for Instance:", INSTANCE_ID);

    const url = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/update-webhook`;

    const payload = {
        value: SUPABASE_WEBHOOK_URL,
        webhook_security_token: SECURITY_TOKEN
    };

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Client-Token": SECURITY_TOKEN
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response:", data);

        if (response.ok) {
            console.log("✅ Webhook Configured Successfully!");
        } else {
            console.error("❌ Failed to configure webhook:", data);
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

configureWebhooks();
