import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react'

export function SignUpPage() {
    const [name, setName] = useState('')
    const [company, setCompany] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error: signUpError } = await signUp(email, password, {
            name,
            companyName: company
        })

        if (signUpError) {
            setError(signUpError.message || 'Erro ao criar conta')
            setLoading(false)
            return
        }

        // Account created successfully
        // Redirect to dashboard (or email confirmation page if email confirm is on)
        navigate('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-surface-950 dark:to-surface-900">
            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <Link to="/" className="text-center mb-8 block hover:opacity-80 transition-opacity">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">WhatsApp AI</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">
                        Comece a automatizar sua empresa hoje
                    </p>
                </Link>

                {/* SignUp Card */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="label">
                                Nome completo
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input"
                                placeholder="Seu nome"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="company" className="label">
                                Nome da empresa
                            </label>
                            <input
                                id="company"
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="input"
                                placeholder="Sua empresa"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pr-10"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                                Mínimo de 6 caracteres
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                'Criar conta grátis'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[var(--color-text-secondary)]">
                            Já tem uma conta?{' '}
                            <Link
                                to="/login"
                                className="text-primary-500 hover:text-primary-600 font-medium"
                            >
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
                    WhatsAppAI®SaaS. | Desenvolvido por BananaMachinada®DS © 2026.
                </p>
            </div>
        </div>
    )
}
