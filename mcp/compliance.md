# Compliance & Security Rules

## Data Protection (LGPD/GDPR)

### Consent Requirements
- Explicit consent required before data collection
- Clear purpose explanation for each data request
- Right to access, correct, and delete data

### Data Minimization
Only collect:
- Name (for personalization)
- Phone number (already in WhatsApp)
- Email (if needed for order/support)
- Order-related information

### Prohibited Data Collection
Never ask for:
- CPF/ID numbers (unless legally required)
- Credit card numbers
- Passwords
- Health information
- Biometric data

## Data Retention

| Data Type | Retention Period | After Expiry |
|-----------|------------------|--------------|
| Conversations | 90 days | Anonymize |
| Lead data | 2 years | Delete |
| Order data | 5 years | Archive |
| Support tickets | 3 years | Delete |

## Security Policies

### Message Handling
- No sensitive data in AI responses
- Mask phone numbers in logs (last 4 digits only)
- Encrypt all stored conversations

### Authentication
- Verify identity for account changes
- Multi-factor for sensitive operations
- Session timeout after 30 minutes inactivity

## Disclosure Requirements
The agent must:
- Identify as AI when asked
- Provide company contact information
- Explain data usage when requested
- Offer human alternative

## Prohibited Actions
- Sharing customer data with third parties
- Making promises on behalf of the company
- Processing payments directly
- Accessing data from other customers

## Audit Trail
Log all:
- AI decisions with reasoning
- Escalation triggers
- Data access events
- Customer consent records

## Incident Response
On data breach suspicion:
1. Immediately escalate to admin
2. Pause automated responses
3. Log all relevant details
4. Notify security team via emergency webhook
