/**
 * Simple script to list available Gemini models
 */
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY not found in environment");
  Deno.exit(1);
}

async function listModels(version: string) {
  console.log(`\n--- Models for API ${version} ---`);
  const url = `https://generativelanguage.googleapis.com/${version}/models?key=${GEMINI_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Error ${res.status}: ${await res.text()}`);
      return;
    }
    const data = await res.json();
    if (data.models) {
      data.models.forEach((m: any) => {
        console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
      });
    } else {
      console.log("No models found or error in response structure.");
    }
  } catch (e) {
    console.error(`Fetch error: ${e.message}`);
  }
}

await listModels("v1");
await listModels("v1beta");
