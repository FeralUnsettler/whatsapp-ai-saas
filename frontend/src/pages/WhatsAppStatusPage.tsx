import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Wifi, WifiOff, Smartphone, RefreshCw, Loader2 } from 'lucide-react'

interface ZAPIStatus {
    connected: boolean
    phone?: string
}

export function WhatsAppStatusPage() {
    const [status, setStatus] = useState<ZAPIStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const checkStatus = async () => {
        setLoading(true)
        setError('')
        try {
            const { data, error } = await supabase.functions.invoke('get-zapi-status')
            if (error) throw error
            setStatus(data)
        } catch (err) {
            console.error(err)
            setError('Erro ao verificar status. Tente novamente.')
            // Mock for demo if function fails locally without being deployed
            // setStatus({ connected: true, phone: '555199999999' }) 
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkStatus()
    }, [])

    return (
        <div className="space-y-6 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold gradient-text">Status do WhatsApp</h1>
                <p className="text-[var(--color-text-secondary)] mt-2">
                    Verifique a conexão da sua instância Z-API
                </p>
            </header>

            <div className="card max-w-2xl">
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-semibold">Conexão</h2>
                    <button
                        onClick={checkStatus}
                        disabled={loading}
                        className="btn-ghost p-2"
                        title="Atualizar"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                    {loading && !status ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                            <p>Verificando conexão...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500">
                            <WifiOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>{error}</p>
                            <button onClick={checkStatus} className="btn-secondary mt-4">
                                Tentar novamente
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={`
                                w-24 h-24 rounded-full flex items-center justify-center mb-2
                                ${status?.connected ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}
                            `}>
                                {status?.connected ? (
                                    <Wifi className="w-12 h-12" />
                                ) : (
                                    <WifiOff className="w-12 h-12" />
                                )}
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-2">
                                    {status?.connected ? 'Conectado' : 'Desconectado'}
                                </h3>
                                <p className="text-[var(--color-text-secondary)]">
                                    {status?.connected
                                        ? 'Sua instância Z-API está online e recebendo mensagens.'
                                        : 'Escaneie o QR Code no painel da Z-API para conectar.'}
                                </p>
                            </div>

                            {status?.phone && (
                                <div className="flex items-center gap-3 px-6 py-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
                                    <Smartphone className="w-5 h-5 text-primary-500" />
                                    <span className="font-mono text-lg">{status.phone}</span>
                                </div>
                            )}

                            {!status?.connected && (
                                <a
                                    href="https://admin.z-api.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                >
                                    Ir para Painel Z-API
                                </a>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
