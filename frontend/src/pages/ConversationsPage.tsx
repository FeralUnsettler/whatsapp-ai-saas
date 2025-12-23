import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, Conversation, Message } from '../lib/supabase'
import {
    ArrowLeft,
    Send,
    Phone,
    User,
    Bot,
    Clock,
    MoreVertical,
    AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ConversationsPage() {
    const { id } = useParams()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchConversations()
    }, [])

    useEffect(() => {
        if (id) {
            fetchMessages(id)
        }
    }, [id])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchConversations = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('conversations')
            .select('*')
            .order('last_message_at', { ascending: false })

        setConversations(data || [])
        setLoading(false)
    }

    const fetchMessages = async (conversationId: string) => {
        const { data: conv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single()

        setSelectedConversation(conv)

        const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        setMessages(msgs || [])
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedConversation) return

        setSending(true)

        // Call the Edge Function to send message
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        conversationId: selectedConversation.id,
                        content: newMessage,
                        senderType: 'human',
                    }),
                }
            )

            if (response.ok) {
                setNewMessage('')
                // Refetch messages
                await fetchMessages(selectedConversation.id)
            }
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setSending(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="badge badge-success">Ativo</span>
            case 'escalated':
                return <span className="badge badge-warning">Escalado</span>
            case 'resolved':
                return <span className="badge badge-info">Resolvido</span>
            default:
                return <span className="badge">{status}</span>
        }
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex animate-fade-in">
            {/* Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--color-border)] flex flex-col ${id ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[var(--color-border)]">
                    <h1 className="text-xl font-bold">Conversas</h1>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {conversations.length} conversas
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-700" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-32 mb-2" />
                                        <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-48" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : conversations.length > 0 ? (
                        conversations.map((conv) => (
                            <Link
                                key={conv.id}
                                to={`/dashboard/conversations/${conv.id}`}
                                className={`block p-4 border-b border-[var(--color-border)] hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors ${id === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium text-lg flex-shrink-0">
                                        {conv.customer_name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="font-medium truncate">
                                                {conv.customer_name || conv.customer_phone}
                                            </p>
                                            {getStatusBadge(conv.status)}
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                                            {conv.customer_phone}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
                                            <Clock className="w-3 h-3" />
                                            {conv.last_message_at
                                                ? formatDistanceToNow(new Date(conv.last_message_at), {
                                                    addSuffix: true,
                                                    locale: ptBR,
                                                })
                                                : 'Sem mensagens'}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-8 text-center text-[var(--color-text-secondary)]">
                            <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Nenhuma conversa ainda</p>
                            <p className="text-sm mt-1">
                                As conversas aparecerão aqui quando clientes enviarem mensagens
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Message View */}
            <div className={`flex-1 flex flex-col ${!id ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
                            <Link
                                to="/dashboard/conversations"
                                className="md:hidden btn-ghost p-2"
                                aria-label="Voltar para conversas"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                                {selectedConversation.customer_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">
                                    {selectedConversation.customer_name || selectedConversation.customer_phone}
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    {selectedConversation.customer_phone}
                                </p>
                            </div>
                            {selectedConversation.status === 'escalated' && (
                                <div className="flex items-center gap-2 text-amber-500">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Aguardando atendimento</span>
                                </div>
                            )}
                            <button className="btn-ghost p-2" aria-label="Mais opções">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.direction === 'outbound'
                                                ? msg.sender_type === 'agent'
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-blue-500 text-white'
                                                : 'bg-surface-100 dark:bg-surface-800'
                                            }`}
                                    >
                                        {msg.direction === 'outbound' && (
                                            <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
                                                {msg.sender_type === 'agent' ? (
                                                    <>
                                                        <Bot className="w-3 h-3" />
                                                        <span>IA</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <User className="w-3 h-3" />
                                                        <span>Humano</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                        <p
                                            className={`text-xs mt-1 ${msg.direction === 'outbound'
                                                    ? 'text-white/70'
                                                    : 'text-[var(--color-text-secondary)]'
                                                }`}
                                        >
                                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 border-t border-[var(--color-border)]"
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Digite uma mensagem..."
                                    className="input flex-1"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="btn-primary p-3"
                                    aria-label="Enviar mensagem"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)]">
                        <div className="text-center">
                            <Phone className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">Selecione uma conversa</p>
                            <p className="text-sm mt-1">
                                Escolha uma conversa à esquerda para ver as mensagens
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
