import { useState, useEffect } from 'react'
import { supabase, Agent } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import {
    Bot,
    Save,
    RefreshCw,
    Sparkles,
    Sliders,
    FileText,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react'

export function AgentConfigPage() {
    const { user, loading: authLoading } = useAuth()
    const [agent, setAgent] = useState<Partial<Agent>>({
        name: 'Agente Principal',
        description: 'Agente de atendimento automatizado',
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        max_tokens: 500,
        system_prompt: '',
        is_active: true,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!authLoading) {
            if (user?.client_id) {
                fetchAgent()
            } else {
                setLoading(false)
            }
        }
    }, [user, authLoading])

    const fetchAgent = async () => {
        if (!user?.client_id) return
        
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .eq('client_id', user.client_id)
                .maybeSingle()

            if (error && error.code !== 'PGRST116') {
                throw error
            }

            if (data) {
                setAgent(data)
            }
        } catch (error) {
            console.error('Error fetching agent:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!user?.client_id) return
        
        setSaving(true)
        setSaved(false)

        try {
            const agentData = {
                ...agent,
                client_id: user.client_id,
            }

            if (agent.id) {
                await supabase.from('agents').update(agentData).eq('id', agent.id)
            } else {
                const { data, error } = await supabase
                    .from('agents')
                    .insert(agentData)
                    .select()
                    .single()
                
                if (error) throw error
                if (data) setAgent(data)
            }
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (error) {
            console.error('Error saving agent:', error)
            alert('Erro ao salvar as configurações do agente.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-48" />
                <div className="card p-6 space-y-4">
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-32" />
                    <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded" />
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24" />
                    <div className="h-32 bg-surface-200 dark:bg-surface-700 rounded" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Configuração do Agente</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Configure o comportamento do seu agente IA
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAgent}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Recarregar
                    </button>
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
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Salvar
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Informações Básicas</h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Identidade do seu agente
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Nome do Agente</label>
                                <input
                                    type="text"
                                    value={agent.name || ''}
                                    onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                                    className="input"
                                    placeholder="Ex: Assistente de Vendas"
                                />
                            </div>

                            <div>
                                <label className="label">Descrição</label>
                                <textarea
                                    value={agent.description || ''}
                                    onChange={(e) =>
                                        setAgent({ ...agent, description: e.target.value })
                                    }
                                    className="input min-h-[80px] resize-none"
                                    placeholder="Descreva a função do agente..."
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-surface-50 dark:bg-surface-800">
                                <div>
                                    <p className="font-medium">Agente Ativo</p>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        Ativar ou desativar as respostas automáticas
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        aria-label="Ativar agente"
                                        checked={agent.is_active}
                                        onChange={(e) =>
                                            setAgent({ ...agent, is_active: e.target.checked })
                                        }
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-surface-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* System Prompt */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Instruções Personalizadas</h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Instruções adicionais ao contexto MCP
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="label">System Prompt Adicional</label>
                            <textarea
                                value={agent.system_prompt || ''}
                                onChange={(e) =>
                                    setAgent({ ...agent, system_prompt: e.target.value })
                                }
                                className="input min-h-[200px] font-mono text-sm"
                                placeholder="Adicione instruções específicas para o agente...&#10;&#10;Exemplo:&#10;- Sempre mencione promoções ativas&#10;- Pergunte o nome do cliente no início&#10;- Ofereça atendimento humano após 3 perguntas técnicas"
                            />
                            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                Estas instruções são combinadas com as regras MCP configuradas
                                no sistema.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    {/* Model Settings */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Modelo IA</h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Configurações do LLM
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="agent-model" className="label">Modelo</label>
                                <select
                                    id="agent-model"
                                    value={agent.model || 'gemini-2.0-flash'}
                                    onChange={(e) => setAgent({ ...agent, model: e.target.value })}
                                    className="input"
                                >
                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                    <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="agent-temp" className="label flex items-center justify-between">
                                    Temperatura
                                    <span className="text-primary-500">{agent.temperature}</span>
                                </label>
                                <input
                                    id="agent-temp"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={agent.temperature || 0.7}
                                    onChange={(e) =>
                                        setAgent({ ...agent, temperature: parseFloat(e.target.value) })
                                    }
                                    className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer dark:bg-surface-700 accent-primary-500"
                                />
                                <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-1">
                                    <span>Preciso</span>
                                    <span>Criativo</span>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="agent-tokens" className="label">Máximo de Tokens</label>
                                <input
                                    id="agent-tokens"
                                    type="number"
                                    value={agent.max_tokens || 500}
                                    onChange={(e) =>
                                        setAgent({ ...agent, max_tokens: parseInt(e.target.value) })
                                    }
                                    className="input"
                                    min="100"
                                    max="2000"
                                />
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                    Controla o tamanho máximo das respostas
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* MCP Status */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Sliders className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Contexto MCP</h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Arquivos de contexto ativos
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {['system.md', 'business.md', 'tone.md', 'escalation.md', 'compliance.md'].map(
                                (file) => (
                                    <div
                                        key={file}
                                        className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800"
                                    >
                                        <span className="text-sm font-mono">{file}</span>
                                        <span className="badge badge-success">Ativo</span>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>
                                    Para editar os arquivos MCP, acesse a pasta <code>/mcp</code>{' '}
                                    no repositório.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
