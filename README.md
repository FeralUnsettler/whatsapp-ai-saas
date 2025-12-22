# WhatsAppAI®SaaS 🚀

**Desenvolvido por BananaMachinada®DS © 2026. Powered by BMDS®Tech**

Multi-tenant SaaS para atendimento automatizado via WhatsApp com IA, projetado
para escalar o faturamento de PMEs através de automação inteligente.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-20+-blue)
![Supabase](https://img.shields.io/badge/supabase-edge%20functions-orange)

## 🎯 Objetivo Comercial (Jan/2026)

- **Meta:** MRR ≥ R$ 3.000
- **Público-alvo:** Clínicas, Prestadores de Serviço, Escolas e Pequenas
  Empresas Locais.
- **Proposta de Valor:** Transformar o WhatsApp em uma máquina de vendas 24/7.

## 🚀 Funcionalidades Pro

- **Atendimento IA Humano:** Respostas naturais com Gemini 1.5 Flash.
- **Qualificação de Leads:** Captura automática de nome, interesse e contato.
- **Escalação Inteligente:** Transferência automática para humano em casos
  críticos.
- **Multi-tenant:** Isolamento total de dados via Row Level Security (RLS).
- **Dashboard Executivo:** Visualização clara de leads, conversões e uso.
- **Automações via n8n:** Integração com CRM e alertas proativos.

## 💰 Modelo de Negócio

- **Plano Pro:** R$ 297/mês
- **Setup Opcional:** R$ 300 (Configuração e treinamento inicial)

## 🏗️ Arquitetura Técnica

```
┌─────────────────┐     ┌──────────────────┐
│   WhatsApp      │────▶│  Edge Function   │
│   (Z-API / Cloud)│     │  (webhook)       │
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

## 📋 Requisitos de Operação

- Supabase (Backend & Auth)
- Gemini API (Intelligence)
- Z-API / WhatsApp Cloud API (Communication)
- n8n (Orchestration)
- React + Vite (Frontend)

## 🔧 Configuração Rápida

1. Clone e `npm install` no frontend.
2. Configure o `.env` com as chaves do Supabase e Gemini.
3. Configure a Instance Z-API para o webhook.

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

| Arquivo         | Propósito                         |
| --------------- | --------------------------------- |
| `system.md`     | Regras globais, limites, formatos |
| `business.md`   | Info da empresa, produtos, FAQ    |
| `tone.md`       | Estilo de comunicação, idioma     |
| `escalation.md` | Quando transferir para humano     |
| `compliance.md` | LGPD, retenção de dados           |

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

Desenvolvido com ❤️ por **BananaMachinada®DS**
