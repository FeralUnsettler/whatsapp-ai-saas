import { useRef, useEffect } from 'react'
import {
    CreditCard,
    Check,
    ArrowRight,
    Zap,
    AlertTriangle,
    Clock,
    TrendingUp,
} from 'lucide-react'

import styles from './BillingPage.module.css'

export function BillingPage() {
    const currentPlan = 'free'
    const progressRef = useRef<HTMLDivElement>(null)

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            features: [
                '100 mensagens/mês',
                '1 número WhatsApp',
                '1 agente IA',
                'Suporte por email',
            ],
        },
        {
            id: 'starter',
            name: 'Starter',
            price: 97,
            popular: true,
            features: [
                '1.000 mensagens/mês',
                '2 números WhatsApp',
                '3 agentes IA',
                'Suporte prioritário',
                'Relatórios básicos',
            ],
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 297,
            features: [
                '10.000 mensagens/mês',
                '5 números WhatsApp',
                'Agentes ilimitados',
                'Suporte 24/7',
                'Relatórios avançados',
                'API access',
                'Custom branding',
            ],
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: null,
            features: [
                'Mensagens ilimitadas',
                'Números ilimitados',
                'Agentes ilimitados',
                'Suporte dedicado',
                'SLA garantido',
                'On-premise option',
                'Custom integrations',
            ],
        },
    ]

    const usage = {
        messages: { used: 47, limit: 100, percentage: 47 },
        whatsappNumbers: { used: 1, limit: 1 },
        agents: { used: 1, limit: 1 },
    }

    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.style.setProperty('--progress-width', `${usage.messages.percentage}%`)
        }
    }, [usage.messages.percentage])

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Cobrança</h1>
                <p className="text-secondary">
                    Gerencie seu plano e uso
                </p>
            </div>

            {/* Current Usage */}
            <div className="card p-6">
                <h2 className="font-semibold mb-4">Uso Atual</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Messages */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-secondary">
                                Mensagens
                            </span>
                            <span className="text-sm font-medium">
                                {usage.messages.used} / {usage.messages.limit}
                            </span>
                        </div>
                        <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                            <div
                                ref={progressRef}
                                className={styles.progressFill}
                            />
                        </div>
                        {usage.messages.percentage > 80 && (
                            <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Limite quase atingido
                            </p>
                        )}
                    </div>

                    {/* WhatsApp Numbers */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium">Números WhatsApp</p>
                                <p className="text-sm text-secondary">
                                    {usage.whatsappNumbers.used} de {usage.whatsappNumbers.limit}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Agents */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium">Agentes IA</p>
                                <p className="text-sm text-secondary">
                                    {usage.agents.used} de {usage.agents.limit}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans */}
            <div>
                <h2 className="font-semibold mb-4">Planos Disponíveis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`card p-6 relative ${plan.popular
                                    ? 'ring-2 ring-primary-500'
                                    : ''
                                } ${currentPlan === plan.id
                                    ? 'bg-primary-50 dark:bg-primary-900/20'
                                    : ''
                                }`}
                        >
                            {plan.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-primary-500 text-white">
                                    Mais popular
                                </span>
                            )}

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold">{plan.name}</h3>
                                <div className="mt-2">
                                    {plan.price !== null ? (
                                        <>
                                            <span className="text-3xl font-bold">
                                                R${plan.price}
                                            </span>
                                            <span className="text-secondary">
                                                /mês
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-lg font-medium text-secondary">
                                            Personalizado
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <Check className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {currentPlan === plan.id ? (
                                <button className="btn-secondary w-full" disabled>
                                    Plano atual
                                </button>
                            ) : plan.price === null ? (
                                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                                    Falar com vendas
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button className="btn-primary w-full flex items-center justify-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Upgrade
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Billing History */}
            <div className="card p-6">
                <h2 className="font-semibold mb-4">Histórico de Faturas</h2>
                <div className="text-center py-8 text-secondary">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma fatura ainda</p>
                    <p className="text-sm mt-1">
                        As faturas aparecerão aqui quando você fizer upgrade
                    </p>
                </div>
            </div>
        </div>
    )
}
