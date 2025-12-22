import { useEffect, useState } from 'react'
import { MetricCard } from '../components/MetricCard'
import { supabase, Conversation, Lead } from '../lib/supabase'
import {
    MessageSquare,
    Users,
    Bot,
    TrendingUp,
    ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

// Mock data for demo
const chartData = [
    { date: 'Seg', messages: 120, leads: 12 },
    { date: 'Ter', messages: 180, leads: 18 },
    { date: 'Qua', messages: 150, leads: 15 },
    { date: 'Qui', messages: 220, leads: 22 },
    { date: 'Sex', messages: 280, leads: 28 },
    { date: 'Sáb', messages: 160, leads: 16 },
    { date: 'Dom', messages: 90, leads: 9 },
]

export function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState({
        totalConversations: 0,
        activeConversations: 0,
        totalLeads: 0,
        hotLeads: 0,
        aiResponses: 0,
        conversionRate: 0,
    })
    const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
    const [recentLeads, setRecentLeads] = useState<Lead[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch conversations
            const { data: conversations } = await supabase
                .from('conversations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            // Fetch leads
            const { data: leads } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            // Fetch counts
            const { count: totalConv } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })

            const { count: activeConv } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active')

            const { count: totalLeads } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })

            const { count: hotLeads } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('temperature', 'hot')

            setMetrics({
                totalConversations: totalConv || 0,
                activeConversations: activeConv || 0,
                totalLeads: totalLeads || 0,
                hotLeads: hotLeads || 0,
                aiResponses: 1847, // Demo value
                conversionRate: 12.5, // Demo value
            })

            setRecentConversations(conversations || [])
            setRecentLeads(leads || [])
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Visão geral do seu atendimento automatizado
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                        Última atualização: agora
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Conversas Ativas"
                    value={metrics.activeConversations}
                    change={12}
                    changeLabel="vs. ontem"
                    icon={<MessageSquare className="w-5 h-5" />}
                    loading={loading}
                />
                <MetricCard
                    title="Total de Leads"
                    value={metrics.totalLeads}
                    change={8}
                    changeLabel="esta semana"
                    icon={<Users className="w-5 h-5" />}
                    loading={loading}
                />
                <MetricCard
                    title="Leads Quentes"
                    value={metrics.hotLeads}
                    change={-3}
                    changeLabel="vs. semana passada"
                    icon={<TrendingUp className="w-5 h-5" />}
                    loading={loading}
                />
                <MetricCard
                    title="Respostas IA"
                    value={metrics.aiResponses.toLocaleString()}
                    change={24}
                    changeLabel="este mês"
                    icon={<Bot className="w-5 h-5" />}
                    loading={loading}
                />
            </div>

            {/* Chart */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Atividade da Semana</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'currentColor' }}
                                className="text-[var(--color-text-secondary)]"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'currentColor' }}
                                className="text-[var(--color-text-secondary)]"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="messages"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMessages)"
                                name="Mensagens"
                            />
                            <Area
                                type="monotone"
                                dataKey="leads"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorLeads)"
                                name="Leads"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Conversations */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                        <h2 className="font-semibold">Conversas Recentes</h2>
                        <Link
                            to="/conversations"
                            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
                        >
                            Ver todas <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-4 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-32 mb-2" />
                                            <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-48" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : recentConversations.length > 0 ? (
                            recentConversations.map((conv) => (
                                <Link
                                    key={conv.id}
                                    to={`/conversations/${conv.id}`}
                                    className="p-4 flex items-center gap-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                                        {conv.customer_name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {conv.customer_name || conv.customer_phone}
                                        </p>
                                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                                            {conv.message_count} mensagens
                                        </p>
                                    </div>
                                    <span
                                        className={`badge ${conv.status === 'active'
                                                ? 'badge-success'
                                                : conv.status === 'escalated'
                                                    ? 'badge-warning'
                                                    : 'badge-info'
                                            }`}
                                    >
                                        {conv.status === 'active'
                                            ? 'Ativo'
                                            : conv.status === 'escalated'
                                                ? 'Escalado'
                                                : 'Resolvido'}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center text-[var(--color-text-secondary)]">
                                Nenhuma conversa ainda
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                        <h2 className="font-semibold">Leads Recentes</h2>
                        <Link
                            to="/leads"
                            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
                        >
                            Ver todos <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-4 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-32 mb-2" />
                                            <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-24" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : recentLeads.length > 0 ? (
                            recentLeads.map((lead) => (
                                <Link
                                    key={lead.id}
                                    to={`/leads/${lead.id}`}
                                    className="p-4 flex items-center gap-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                                        {lead.customer_name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {lead.customer_name || lead.customer_phone}
                                        </p>
                                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                                            Score: {lead.score}
                                        </p>
                                    </div>
                                    <span
                                        className={`badge ${lead.temperature === 'hot'
                                                ? 'badge-error'
                                                : lead.temperature === 'warm'
                                                    ? 'badge-warning'
                                                    : 'badge-info'
                                            }`}
                                    >
                                        {lead.temperature === 'hot'
                                            ? '🔥 Quente'
                                            : lead.temperature === 'warm'
                                                ? '☀️ Morno'
                                                : '❄️ Frio'}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center text-[var(--color-text-secondary)]">
                                Nenhum lead ainda
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
