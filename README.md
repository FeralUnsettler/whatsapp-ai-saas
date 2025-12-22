# WhatsApp AI SaaS

Multi-tenant SaaS para atendimento automatizado via WhatsApp com IA, usando Supabase, Gemini, n8n e React.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-20+-blue)
![Supabase](https://img.shields.io/badge/supabase-edge%20functions-orange)

## 🚀 Features

- **Atendimento IA**: Respostas automáticas com Gemini Pro
- **Multi-tenant**: Suporte a múltiplos clientes com RLS
- **MCP Protocol**: Contexto configurável por cliente
- **Escalação**: Regras automáticas de handoff humano
- **Dashboard**: Interface React moderna com dark/light mode
- **Automações**: Workflows n8n para leads e notificações
- **LGPD**: Compliance de privacidade integrado

## 📋 Requisitos

- Node.js 20+
- Conta Supabase (gratuita)
- API Key Gemini (Google AI Studio)
- WhatsApp Business API (Meta)
- n8n (self-hosted ou cloud)

## ⚡ Quick Start

### 1. Clone e configure

```bash
git clone https://github.com/seu-usuario/whatsapp-ai-saas.git
cd whatsapp-ai-saas
cp .env.example .env
```

### 2. Configure as variáveis de ambiente

Edite `.env` com suas credenciais:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-key
GEMINI_API_KEY=sua-api-key
WHATSAPP_PHONE_NUMBER_ID=seu-phone-id
WHATSAPP_ACCESS_TOKEN=seu-token
```

### 3. Configure o Supabase

```bash
# Execute a migration no Supabase Dashboard
# SQL Editor > Cole o conteúdo de supabase/migrations/001_initial_schema.sql
```

### 4. Inicie o frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌──────────────────┐
│   WhatsApp      │────▶│  Edge Function   │
│   Cloud API     │     │  (webhook)       │
└─────────────────┘     └────────┬─────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      Supabase           │
                    │  ┌─────────────────┐   │
                    │  │  PostgreSQL     │   │
                    │  │  + RLS          │   │
                    │  └─────────────────┘   │
                    │  ┌─────────────────┐   │
                    │  │  Edge Functions │   │
                    │  │  (Gemini AI)    │   │
                    │  └─────────────────┘   │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
    │  React Frontend │ │    n8n      │ │  Gemini API     │
    │  (Dashboard)    │ │  (Webhooks) │ │  (LLM)          │
    └─────────────────┘ └─────────────┘ └─────────────────┘
```

## 📁 Estrutura

```
whatsapp-ai-saas/
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks customizados
│   │   └── lib/           # Utilitários
│   └── ...
├── supabase/
│   ├── functions/         # Edge Functions
│   │   ├── webhook-whatsapp/
│   │   ├── process-message/
│   │   ├── send-whatsapp/
│   │   └── _shared/       # Código compartilhado
│   └── migrations/        # SQL migrations
├── mcp/                   # Model Context Protocol
│   ├── system.md          # Regras globais
│   ├── business.md        # Contexto de negócio
│   ├── tone.md            # Tom de voz
│   ├── escalation.md      # Regras de escalação
│   └── compliance.md      # LGPD/segurança
├── n8n/
│   └── workflows/         # JSONs para importar
├── docker-compose.yml     # Dev local
└── .github/workflows/     # CI/CD
```

## 🔧 Configuração do WhatsApp

1. Acesse [Meta Business Suite](https://business.facebook.com/)
2. Crie um app com produto WhatsApp
3. Configure o webhook apontando para:
   ```
   https://seu-projeto.supabase.co/functions/v1/webhook-whatsapp
   ```
4. Use o `WHATSAPP_VERIFY_TOKEN` do seu `.env`

## 🤖 MCP - Model Context Protocol

O MCP define o comportamento da IA. Edite os arquivos em `/mcp`:

| Arquivo | Propósito |
|---------|-----------|
| `system.md` | Regras globais, limites, formatos |
| `business.md` | Info da empresa, produtos, FAQ |
| `tone.md` | Estilo de comunicação, idioma |
| `escalation.md` | Quando transferir para humano |
| `compliance.md` | LGPD, retenção de dados |

## 🔄 n8n Workflows

Importe os workflows em sua instância n8n:

- `new-lead-notification.json` - Notifica novos leads
- `escalation-alert.json` - Alerta escalonamentos
- `follow-up-automation.json` - Follow-up automático
- `payment-failure.json` - Suspensão por falha de pagamento

## 🐳 Docker

```bash
# Desenvolvimento local
docker-compose up

# Build de produção
docker build -t whatsapp-ai-saas .
docker run -p 80:80 whatsapp-ai-saas
```

## 📊 Monitoramento

Métricas disponíveis no dashboard:
- Conversas ativas
- Leads por temperatura
- Taxa de escalação
- Uso de mensagens/plano

## 🔐 Segurança

- Row Level Security (RLS) em todas as tabelas
- Autenticação via Supabase Auth
- Secrets em variáveis de ambiente
- HTTPS obrigatório

## 📄 Licença

MIT

---

Desenvolvido com ❤️ usando Supabase, Gemini e React
