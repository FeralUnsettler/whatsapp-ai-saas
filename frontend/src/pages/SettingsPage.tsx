import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import {
    User,
    Bell,
    Shield,
    Plug,
    Moon,
    Sun,
    Save,
    Eye,
    EyeOff,
    CheckCircle,
} from 'lucide-react'

export function SettingsPage() {
    const { user } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [activeTab, setActiveTab] = useState('profile')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [profile, setProfile] = useState({
        fullName: user?.full_name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
    })

    const [notifications, setNotifications] = useState({
        emailNewLead: true,
        emailEscalation: true,
        emailWeeklyReport: false,
        pushMessages: true,
    })

    const handleSave = async () => {
        setSaving(true)
        // Simulate API call
        await new Promise((r) => setTimeout(r, 1000))
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'security', label: 'Segurança', icon: Shield },
        { id: 'integrations', label: 'Integrações', icon: Plug },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Configurações</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Gerencie sua conta e preferências
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                >
                    {saved ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Salvo
                        </>
                    ) : saving ? (
                        'Salvando...'
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Salvar alterações
                        </>
                    )}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tabs */}
                <div className="lg:w-48 flex lg:flex-col gap-1 overflow-x-auto scrollbar-thin">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                                    : 'text-[var(--color-text-secondary)] hover:bg-surface-100 dark:hover:bg-surface-800'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1">
                    {/* Profile */}
                    {activeTab === 'profile' && (
                        <div className="card p-6 space-y-6">
                            <div>
                                <h2 className="font-semibold mb-4">Informações Pessoais</h2>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold">
                                        {profile.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <button className="btn-secondary text-sm">
                                            Alterar foto
                                        </button>
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                            JPG, GIF ou PNG. Max 1MB.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="fullName" className="label">Nome completo</label>
                                        <input
                                            id="fullName"
                                            type="text"
                                            placeholder="Seu nome completo"
                                            value={profile.fullName}
                                            onChange={(e) =>
                                                setProfile({ ...profile, fullName: e.target.value })
                                            }
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="label">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={profile.email}
                                            onChange={(e) =>
                                                setProfile({ ...profile, email: e.target.value })
                                            }
                                            className="input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[var(--color-border)]" />

                            <div>
                                <h2 className="font-semibold mb-4">Alterar Senha</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="currentPassword" className="label">Senha atual</label>
                                        <div className="relative">
                                            <input
                                                id="currentPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Sua senha atual"
                                                value={profile.currentPassword}
                                                onChange={(e) =>
                                                    setProfile({
                                                        ...profile,
                                                        currentPassword: e.target.value,
                                                    })
                                                }
                                                className="input pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"
                                                aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                                                title={showPassword ? "Ocultar senha" : "Ver senha"}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="newPassword" className="label">Nova senha</label>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Mínimo 8 caracteres"
                                            value={profile.newPassword}
                                            onChange={(e) =>
                                                setProfile({ ...profile, newPassword: e.target.value })
                                            }
                                            className="input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[var(--color-border)]" />

                            <div>
                                <h2 className="font-semibold mb-4">Aparência</h2>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
                                    <div className="flex items-center gap-3">
                                        {theme === 'light' ? (
                                            <Sun className="w-5 h-5 text-amber-500" />
                                        ) : (
                                            <Moon className="w-5 h-5 text-blue-500" />
                                        )}
                                        <div>
                                            <p className="font-medium">Tema</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {theme === 'light' ? 'Modo claro' : 'Modo escuro'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={toggleTheme} className="btn-secondary">
                                        Alternar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="card p-6 space-y-4">
                            <h2 className="font-semibold mb-2">Notificações por Email</h2>

                            {[
                                {
                                    key: 'emailNewLead',
                                    title: 'Novo lead',
                                    desc: 'Receba um email quando um novo lead for capturado',
                                },
                                {
                                    key: 'emailEscalation',
                                    title: 'Escalação',
                                    desc: 'Notificação quando uma conversa precisar de atendimento humano',
                                },
                                {
                                    key: 'emailWeeklyReport',
                                    title: 'Relatório semanal',
                                    desc: 'Resumo semanal de atividades e métricas',
                                },
                                {
                                    key: 'pushMessages',
                                    title: 'Push notifications',
                                    desc: 'Notificações em tempo real no navegador',
                                },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between p-4 rounded-lg bg-surface-50 dark:bg-surface-800"
                                >
                                    <div>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            aria-label={item.title}
                                            checked={notifications[item.key as keyof typeof notifications]}
                                            onChange={(e) =>
                                                setNotifications({
                                                    ...notifications,
                                                    [item.key]: e.target.checked,
                                                })
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-surface-300 peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Security */}
                    {activeTab === 'security' && (
                        <div className="card p-6 space-y-6">
                            <div>
                                <h2 className="font-semibold mb-4">Sessões Ativas</h2>
                                <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Navegador atual</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                Windows • Chrome • São Paulo, BR
                                            </p>
                                        </div>
                                        <span className="badge badge-success">Ativo agora</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="font-semibold mb-4">Autenticação em Dois Fatores</h2>
                                <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">2FA</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                Adicione uma camada extra de segurança
                                            </p>
                                        </div>
                                        <button className="btn-secondary">Ativar</button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="font-semibold mb-4 text-red-500">Zona de Perigo</h2>
                                <div className="p-4 rounded-lg border border-red-200 dark:border-red-900">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Excluir conta</p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                Apaga permanentemente sua conta e todos os dados
                                            </p>
                                        </div>
                                        <button className="btn text-red-500 border border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integrations */}
                    {activeTab === 'integrations' && (
                        <div className="card p-6 space-y-4">
                            <h2 className="font-semibold mb-2">Integrações Disponíveis</h2>

                            {[
                                {
                                    name: 'WhatsApp Business',
                                    desc: 'Conecte seu número WhatsApp Business',
                                    connected: true,
                                },
                                {
                                    name: 'n8n',
                                    desc: 'Automação de workflows',
                                    connected: true,
                                },
                                {
                                    name: 'Slack',
                                    desc: 'Receba notificações no Slack',
                                    connected: false,
                                },
                                {
                                    name: 'Zapier',
                                    desc: 'Conecte com 5000+ apps',
                                    connected: false,
                                },
                            ].map((integration) => (
                                <div
                                    key={integration.name}
                                    className="flex items-center justify-between p-4 rounded-lg bg-surface-50 dark:bg-surface-800"
                                >
                                    <div>
                                        <p className="font-medium">{integration.name}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            {integration.desc}
                                        </p>
                                    </div>
                                    {integration.connected ? (
                                        <span className="badge badge-success">Conectado</span>
                                    ) : (
                                        <button className="btn-secondary text-sm">Conectar</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
