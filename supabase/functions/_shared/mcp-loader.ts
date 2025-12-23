/**
 * MCP (Model Context Protocol) Loader
 * Dynamically loads and merges MCP configuration files
 * with client-specific overrides from the database.
 */

interface MCPConfig {
    system: string;
    business: string;
    tone: string;
    escalation: string;
    compliance: string;
}

interface ClientMCPOverrides {
    business?: Record<string, string>;
    tone?: Record<string, string>;
    escalation?: Record<string, string>;
}

// Base MCP content (loaded from files or cached)
const baseMCP: MCPConfig = {
    system: `
# System Rules
- Maximum response: 500 characters
- Always respond in customer's language
- Never pretend to be human
- Stay within business context
- Try to resolve issues autonomously. Only suggest human help if strictly requested.
  `.trim(),

    business: `
# Business Context
Company information and FAQ to be customized per client.
  `.trim(),

    tone: `
# Tone of Voice
- Style: Professional but friendly
- Language: Portuguese (Brazil)
- Emojis: Moderate use
- Greeting: "Olá! 👋 Como posso ajudar?"
  `.trim(),

    escalation: `
# Escalation Rules
- Escalate ONLY when the user explicitly asks for a human agent.
- Keywords: "falar com humano", "atendente", "falar com pessoa".
- Try to resolve the issue at least 3 times before agreeing to escalate.
  `.trim(),

    compliance: `
# Compliance
- LGPD compliant
- No sensitive data collection
- 90-day message retention
- Always identify as AI when asked
  `.trim(),
};

/**
 * Apply template variables to MCP content
 */
function applyTemplateVariables(
    content: string,
    variables: Record<string, string>
): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

/**
 * Load MCP configuration for a specific client
 */
export function loadMCPConfig(
    clientOverrides?: ClientMCPOverrides,
    templateVars?: Record<string, string>
): MCPConfig {
    const config: MCPConfig = { ...baseMCP };

    // Apply client overrides
    if (clientOverrides) {
        if (clientOverrides.business) {
            config.business = applyTemplateVariables(
                config.business,
                clientOverrides.business
            );
        }
        if (clientOverrides.tone) {
            config.tone = applyTemplateVariables(config.tone, clientOverrides.tone);
        }
        if (clientOverrides.escalation) {
            config.escalation = applyTemplateVariables(
                config.escalation,
                clientOverrides.escalation
            );
        }
    }

    // Apply additional template variables
    if (templateVars) {
        for (const key of Object.keys(config) as (keyof MCPConfig)[]) {
            config[key] = applyTemplateVariables(config[key], templateVars);
        }
    }

    return config;
}

/**
 * Build the complete system prompt from MCP config
 */
export function buildSystemPrompt(config: MCPConfig): string {
    return `
${config.system}

---

${config.business}

---

${config.tone}

---

${config.escalation}

---

${config.compliance}
  `.trim();
}

/**
 * Check if message should trigger escalation based on MCP rules
 */
export function shouldEscalate(
    message: string,
    conversationLength: number
): { escalate: boolean; reason?: string } {
    const escalationKeywords = [
        'falar com humano',
        'atendente real',
        'quero falar com uma pessoa',
    ];

    const lowerMessage = message.toLowerCase();

    // Check keywords - strictly explicit requests
    for (const keyword of escalationKeywords) {
        if (lowerMessage.includes(keyword)) {
            return { escalate: true, reason: `Explicit request for human: ${keyword}` };
        }
    }

    // Check conversation length - increase limit to 50
    if (conversationLength >= 50) {
        return { escalate: true, reason: 'High conversation volume - requiring human check' };
    }

    // Removed sentiment-based escalation to allow bot to try harder to resolve frustration

    return { escalate: false };
}
