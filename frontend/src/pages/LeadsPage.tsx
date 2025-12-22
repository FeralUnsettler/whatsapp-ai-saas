import { useState, useEffect } from 'react'
import { supabase, Lead } from '../lib/supabase'
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    Phone,
    Mail,
    Calendar,
    TrendingUp,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterTemp, setFilterTemp] = useState<string>('')
    const [filterStatus, setFilterStatus] = useState<string>('')

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })

        setLeads(data || [])
        setLoading(false)
    }

    const filteredLeads = leads.filter((lead) => {
        const matchesSearch =
            lead.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.customer_phone.includes(searchTerm) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesTemp = !filterTemp || lead.temperature === filterTemp
        const matchesStatus = !filterStatus || lead.status === filterStatus

        return matchesSearch && matchesTemp && matchesStatus
    })

    const getTemperatureBadge = (temp: string) => {
        switch (temp) {
            case 'hot':
                return <span className="badge badge-error">🔥 Quente</span>
            case 'warm':
                return <span className="badge badge-warning">☀️ Morno</span>
            case 'cold':
                return <span className="badge badge-info">❄️ Frio</span>
            default:
                return <span className="badge">{temp}</span>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return <span className="badge badge-info">Novo</span>
            case 'contacted':
                return <span className="badge badge-warning">Contactado</span>
            case 'qualified':
                return <span className="badge badge-success">Qualificado</span>
            case 'converted':
                return <span className="badge bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-400">Convertido</span>
            case 'lost':
                return <span className="badge bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400">Perdido</span>
            default:
                return <span className="badge">{status}</span>
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        {leads.length} leads capturados
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, telefone ou email..."
                            aria-label="Buscar leads"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[var(--color-text-secondary)]" />
                        <select
                            aria-label="Filtrar por temperatura"
                            value={filterTemp}
                            onChange={(e) => setFilterTemp(e.target.value)}
                            className="input py-2 w-auto"
                        >
                            <option value="">Temperatura</option>
                            <option value="hot">🔥 Quente</option>
                            <option value="warm">☀️ Morno</option>
                            <option value="cold">❄️ Frio</option>
                        </select>
                        <select
                            aria-label="Filtrar por status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input py-2 w-auto"
                        >
                            <option value="">Status</option>
                            <option value="new">Novo</option>
                            <option value="contacted">Contactado</option>
                            <option value="qualified">Qualificado</option>
                            <option value="converted">Convertido</option>
                            <option value="lost">Perdido</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Lead</th>
                                <th>Contato</th>
                                <th>Temperatura</th>
                                <th>Status</th>
                                <th>Score</th>
                                <th>Criado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="animate-pulse">
                                            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                                                    {lead.customer_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {lead.customer_name || 'Sem nome'}
                                                    </p>
                                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                                        via WhatsApp
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                                    {lead.customer_phone}
                                                </div>
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                        <Mail className="w-4 h-4" />
                                                        {lead.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{getTemperatureBadge(lead.temperature)}</td>
                                        <td>{getStatusBadge(lead.status)}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-primary-500" />
                                                <span className="font-medium">{lead.score}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                <Calendar className="w-4 h-4" />
                                                {formatDistanceToNow(new Date(lead.created_at), {
                                                    addSuffix: true,
                                                    locale: ptBR,
                                                })}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn-ghost p-1" title="Opções do lead" aria-label="Opções do lead">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-[var(--color-text-secondary)]">
                                        {searchTerm || filterTemp || filterStatus
                                            ? 'Nenhum lead encontrado com esses filtros'
                                            : 'Nenhum lead capturado ainda'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
