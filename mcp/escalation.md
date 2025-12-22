# Escalation Rules - Human Handoff

## Automatic Escalation Triggers

### Keyword Detection
Immediately escalate when customer mentions:
- "falar com humano"
- "atendente real"
- "gerente"
- "supervisor"
- "reclamação"
- "processo"
- "procon"
- "advogado"
- "cancelar tudo"

### Sentiment Triggers
Escalate when detecting:
- High frustration (3+ negative messages in sequence)
- Anger indicators (CAPS LOCK, excessive punctuation)
- Explicit dissatisfaction expressions

### Topic Triggers
Escalate for:
- Billing disputes
- Refund requests over {{REFUND_THRESHOLD}}
- Legal matters
- Medical emergencies
- Security concerns

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

| Level | Description | Response Target |
|-------|-------------|-----------------|
| P1 - Critical | Legal, security, emergencies | Immediate |
| P2 - High | Billing, cancellations | < 5 minutes |
| P3 - Medium | Complex support | < 15 minutes |
| P4 - Low | General inquiries | < 1 hour |

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
