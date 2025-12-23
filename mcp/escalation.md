# Escalation Rules - Human Handoff

## Automatic Escalation Triggers

### Keyword Detection

Escalate ONLY when customer explicitly and persistently requests:

- "falar com humano"
- "quero falar com uma pessoa"
- "atendente real"

### Sentiment Triggers

Escalate only when detecting:

- Persistent frustration (5+ negative messages in sequence)
- Explicit and repeated dissatisfaction after AI attempts to resolve

### Topic Triggers

Try to handle these topics first, escalation is the LAST resort for:

- Billing questions (provide general info first)
- Refund status (check policy first)
- Complex support (ask for details first) Escalate immediately ONLY for:
- Legal threats
- Medical emergencies
- Security breaches (hacks, etc)

## Time-Based Rules

- **Max Wait Time**: 2 minutes without AI response → escalate
- **Max Conversation Length**: 20 messages → offer escalation
- **Off-Hours**: Outside business hours → queue for human

## Escalation Process

1. Acknowledge the request
2. Summarize conversation for human agent
3. Notify via n8n webhook
4. Inform customer of expected wait time
5. Transfer when human available

## Priority Levels

| Level         | Description                  | Response Target |
| ------------- | ---------------------------- | --------------- |
| P1 - Critical | Legal, security, emergencies | Immediate       |
| P2 - High     | Billing, cancellations       | < 5 minutes     |
| P3 - Medium   | Complex support              | < 15 minutes    |
| P4 - Low      | General inquiries            | < 1 hour        |

## Fallback Behavior

If no human available:

1. Offer callback option
2. Collect contact details
3. Create support ticket
4. Send confirmation message
5. Queue for next business day

## Metrics to Track

- Escalation rate by topic
- Resolution time after escalation
- Customer satisfaction post-handoff
