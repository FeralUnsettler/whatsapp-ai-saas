import { NavLink } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Bot,
    CreditCard,
    Settings,
    LogOut,
    Moon,
    Sun,
    Menu,
    X,
    Sparkles,
    Smartphone,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/conversations', label: 'Conversas', icon: MessageSquare },
    { to: '/leads', label: 'Leads', icon: Users },
    { to: '/whatsapp', label: 'Status WhatsApp', icon: Smartphone },
    { to: '/agent', label: 'Agente IA', icon: Bot },
    { to: '/billing', label: 'Cobrança', icon: CreditCard },
    { to: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
    const { theme, toggleTheme } = useTheme()
    const { user, signOut } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 btn-ghost p-2"
                aria-label="Abrir menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[var(--color-card)] border-r border-[var(--color-border)]
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg gradient-text">WhatsApp AI</span>
                    </div>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden btn-ghost p-1"
                        aria-label="Fechar menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-[var(--color-border)] space-y-2">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="sidebar-link w-full"
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon className="w-5 h-5" />
                                <span>Modo Escuro</span>
                            </>
                        ) : (
                            <>
                                <Sun className="w-5 h-5" />
                                <span>Modo Claro</span>
                            </>
                        )}
                    </button>

                    {/* User info and logout */}
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user?.full_name || 'Usuário'}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)] truncate">
                                {user?.email}
                            </p>
                        </div>
                        <button
                            onClick={signOut}
                            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500"
                            title="Sair"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
