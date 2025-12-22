// Test Z-API connection
// Run: npx tsx test-zapi.ts

const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID || '3EC0A5B1CAB792621F6682BF222E0CD5';
const ZAPI_TOKEN = process.env.ZAPI_TOKEN || '611FA31F38FEAAB876385B01';
const ZAPI_SECURITY_TOKEN = process.env.ZAPI_SECURITY_TOKEN || 'F19b9c7d061384d18aec4abe7213f5ba0S';
const TEST_PHONE = '5551989663750';

async function testConnection() {
    console.log('🔍 Testing Z-API connection...\n');

    const statusUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/status`;

    const statusRes = await fetch(statusUrl, {
        headers: { 'Client-Token': ZAPI_SECURITY_TOKEN }
    });
    const status = await statusRes.json();
    console.log('📊 Instance Status:', status);

    if (!status.connected) {
        console.log('❌ Instance not connected. Scan QR code first.');
        return;
    }

    console.log('\n📤 Sending test message...\n');

    const sendUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`;

    const sendRes = await fetch(sendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Client-Token': ZAPI_SECURITY_TOKEN
        },
        body: JSON.stringify({
            phone: TEST_PHONE,
            message: '🤖 Teste WhatsApp AI SaaS - Integração Z-API funcionando!'
        })
    });

    const sendResult = await sendRes.json();
    console.log('📨 Send Result:', sendResult);

    if (sendResult.zapiMessageId) {
        console.log('\n✅ SUCCESS! Message sent with ID:', sendResult.zapiMessageId);
    } else {
        console.log('\n❌ Failed to send message:', sendResult);
    }
}

testConnection().catch(console.error);
