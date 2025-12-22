import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
    Bot, 
    Users, 
    BarChart3, 
    ArrowRight, 
    CheckCircle2, 
    Smartphone,
    Rocket,
    Globe,
    Zap,
    Star
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function LandingPage() {
    const { session } = useAuth()
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        // Simulate lead capture
        setTimeout(() => {
            setIsSubmitting(false)
            setIsSuccess(true)
            setEmail('')
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)] selection:bg-primary-100 selection:text-primary-900">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                                <Bot className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold font-sans tracking-tight">
                                WhatsApp <span className="gradient-text">AI SaaS</span>
                            </span>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-surface-600 hover:text-primary-500 transition-colors">Funcionalidades</a>
                            <a href="#how-it-works" className="text-sm font-medium text-surface-600 hover:text-primary-500 transition-colors">Como Funciona</a>
                            <a href="#leads" className="text-sm font-medium text-surface-600 hover:text-primary-500 transition-colors">Capturar Leads</a>
                        </div>

                        <div className="flex items-center gap-4">
                            {session ? (
                                <Link to="/dashboard" className="btn-primary">
                                    Acessar Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-medium text-surface-600 hover:text-primary-500 transition-colors">
                                        Entrar
                                    </Link>
                                    <Link to="/signup" className="btn-primary">
                                        Começar Agora
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/20 blur-[120px] rounded-full animate-pulse-soft"></div>
                    <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-emerald-200/20 blur-[120px] rounded-full animate-pulse-soft delay-1000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold mb-6 animate-fade-in">
                        <Star className="w-3 h-3 fill-current" />
                        A nova era do atendimento automatizado
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 animate-slide-up">
                        Transforme seu WhatsApp em uma <br />
                        <span className="gradient-text">Máquina de Vendas Ilimitada</span>
                    </h1>
                    
                    <p className="text-lg lg:text-xl text-surface-500 max-w-3xl mx-auto mb-10 animate-slide-up delay-100">
                        Atendimento 24/7 com inteligência artificial humana, captura de leads automática e integração total com seu negócio. O futuro do relacionamento com o cliente chegou.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
                        <Link to="/signup" className="btn-primary px-8 py-4 text-lg rounded-xl flex items-center gap-2 group">
                            Comece seu teste grátis
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#how-it-works" className="btn-secondary px-8 py-4 text-lg rounded-xl">
                            Ver demonstração
                        </a>
                    </div>

                    {/* App Mockup Preview */}
                    <div className="mt-20 relative animate-slide-up delay-400">
                        <div className="card-glass p-2 max-w-5xl mx-auto overflow-hidden shadow-2xl skew-y-[-1deg]">
                            <img 
                                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop" 
                                alt="Dashboard Preview" 
                                className="rounded-lg w-full h-[400px] object-cover opacity-80"
                            />
                            {/* Float UI elements over image */}
                            <div className="absolute top-10 left-10 card-glass p-4 hidden lg:block animate-bounce shadow-lg border-primary-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Zap className="text-white w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-surface-400">Novo Lead Capturado</p>
                                        <p className="text-sm font-bold">João Silva - Interesse: Plano Gold</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-surface-50 dark:bg-surface-950/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Potencialize seu atendimento</h2>
                        <p className="text-surface-500">Tudo o que você precisa para escalar sua operação sem perder a qualidade.</p>
                    </div>

                    <div className="grid md:grid-row-4 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Bot className="w-8 h-8 text-primary-500" />,
                                title: "Inteligência Artificial Gemini",
                                description: "Respostas naturais e contextualizadas usando os modelos mais avançados da Google.",
                                delay: "delay-100"
                            },
                            {
                                icon: <Users className="w-8 h-8 text-primary-500" />,
                                title: "Multi-tenant & RLS",
                                description: "Segurança total dos dados. Cada cliente tem seu próprio ambiente isolado.",
                                delay: "delay-200"
                            },
                            {
                                icon: <BarChart3 className="w-8 h-8 text-primary-500" />,
                                title: "Análise de Leads",
                                description: "Dashboard completo com taxas de conversão, calor de leads e performance de IA.",
                                delay: "delay-300"
                            },
                            {
                                icon: <Zap className="w-8 h-8 text-primary-500" />,
                                title: "Escalação Humana",
                                description: "Transfira para um atendente real automaticamente sempre que a IA identificar necessidade.",
                                delay: "delay-400"
                            },
                            {
                                icon: <Globe className="w-8 h-8 text-primary-500" />,
                                title: "MCP Protocol",
                                description: "Configure o contexto do seu negócio: tom de voz, regras e base de conhecimento infinita.",
                                delay: "delay-500"
                            },
                            {
                                icon: <Rocket className="w-8 h-8 text-primary-500" />,
                                title: "Automação via n8n",
                                description: "Integre com CRM, Email e centenas de ferramentas através de workflows poderosos.",
                                delay: "delay-700"
                            }
                        ].map((feature, idx) => (
                            <div 
                                key={idx} 
                                className={`card p-8 hover:border-primary-500/50 transition-colors group animate-slide-up ${feature.delay}`}
                            >
                                <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 w-fit mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-surface-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works / Demo UI */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Tão humano que seus clientes <br /> <span className="gradient-text">nem vão notar a diferença</span></h2>
                            <p className="text-lg text-surface-500 mb-8">
                                Nossa interface simula perfeitamente uma conversa humana, mas com a velocidade e precisão de uma máquina avançada.
                            </p>
                            
                            <ul className="space-y-6">
                                {[
                                    "Aprendizado contínuo com base nos seus manuais",
                                    "Identificação proativa de intenção de compra",
                                    "Suporte a múltiplos idiomas e gírias locais",
                                    "Agendamento direto no calendário via Chat"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative">
                            {/* WhatsApp UI Mockup */}
                            <div className="bg-white dark:bg-surface-900 rounded-[2.5rem] border-[8px] border-surface-800 dark:border-surface-700 shadow-2xl overflow-hidden max-w-[320px] mx-auto aspect-[9/18]">
                                <div className="bg-emerald-600 p-4 pt-10 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">IA de Atendimento</p>
                                        <p className="text-[10px] opacity-80 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                                            online
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="p-4 space-y-4 text-[12px] bg-[#e5ddd5] dark:bg-[#0b141a] h-full">
                                    <div className="bg-white dark:bg-[#1f2c33] p-2 rounded-lg max-w-[80%] shadow-sm">
                                        Olá! Gostaria de saber os preços do plano enterprise.
                                    </div>
                                    <div className="bg-[#dcf8c6] dark:bg-[#005c4b] p-2 rounded-lg max-w-[80%] self-end ml-auto shadow-sm">
                                        Com certeza! O plano Enterprise é personalizado para sua escala. Quantas mensagens você planeja enviar por mês?
                                    </div>
                                    <div className="bg-white dark:bg-[#1f2c33] p-2 rounded-lg max-w-[80%] shadow-sm">
                                        Cerca de 50 mil contatos por dia.
                                    </div>
                                    <div className="bg-[#dcf8c6] dark:bg-[#005c4b] p-2 rounded-lg max-w-[80%] self-end ml-auto shadow-sm animate-pulse-soft">
                                        Perfeito. Para essa escala, temos integração dedicada. Posso agendar uma call agora com um especialista?
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lead Caption CTA */}
            <section id="leads" className="py-24 bg-primary-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary-400/20 blur-[100px] rounded-full"></div>
                
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Pronto para escalar seu faturamento?</h2>
                    <p className="text-primary-100 text-lg mb-10">
                        Deixe seu email abaixo para receber uma demonstração personalizada e um guia exclusivo de como a IA pode dobrar suas conversões no WhatsApp.
                    </p>

                    <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="email" 
                            required
                            placeholder="Seu melhor email..." 
                            className="flex-1 px-6 py-4 rounded-xl border-none focus:ring-2 focus:ring-primary-300 text-lg shadow-lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button 
                            disabled={isSubmitting || isSuccess}
                            className="bg-surface-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                            ) : isSuccess ? (
                                <>Sucesso! <CheckCircle2 className="w-5 h-5" /></>
                            ) : (
                                "Quero uma Demo"
                            )}
                        </button>
                    </form>
                    
                    {isSuccess && (
                        <p className="mt-4 text-primary-50 font-medium animate-fade-in">
                            Obrigado! Nossa equipe entrará em contato em breve.
                        </p>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2 text-surface-400">
                            <Bot className="w-5 h-5" />
                            <span className="text-sm font-semibold tracking-tight">WhatsAppAI®SaaS. | Desenvolvido por BananaMachinada®DS © 2026. Powered by BMDS®Tech</span>
                        </div>
                        
                        <div className="flex gap-8 text-sm text-surface-500">
                            <a href="#" className="hover:text-primary-500 transition-colors">Privacidade</a>
                            <a href="#" className="hover:text-primary-500 transition-colors">Termos</a>
                            <a href="#" className="hover:text-primary-500 transition-colors">Contato</a>
                        </div>

                        <div className="flex gap-4">
                            <div className="p-2 bg-surface-100 dark:bg-surface-800 rounded-lg hover:text-primary-500 cursor-pointer transition-colors">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="p-2 bg-surface-100 dark:bg-surface-800 rounded-lg hover:text-primary-500 cursor-pointer transition-colors">
                                <Smartphone className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
