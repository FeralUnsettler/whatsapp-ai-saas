import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon?: ReactNode
    loading?: boolean
}

export function MetricCard({
    title,
    value,
    change,
    changeLabel,
    icon,
    loading = false,
}: MetricCardProps) {
    const getTrendIcon = () => {
        if (change === undefined || change === 0) return <Minus className="w-3 h-3" />
        if (change > 0) return <TrendingUp className="w-3 h-3" />
        return <TrendingDown className="w-3 h-3" />
    }

    const getTrendColor = () => {
        if (change === undefined || change === 0) return 'text-surface-500'
        if (change > 0) return 'text-emerald-500'
        return 'text-red-500'
    }

    if (loading) {
        return (
            <div className="card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24" />
                    <div className="w-10 h-10 bg-surface-200 dark:bg-surface-700 rounded-lg" />
                </div>
                <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-32 mb-2" />
                <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-20" />
            </div>
        )
    }

    return (
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {title}
                </h3>
                {icon && (
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        {icon}
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold mb-2">{value}</p>
            {change !== undefined && (
                <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span>{Math.abs(change)}%</span>
                    {changeLabel && (
                        <span className="text-[var(--color-text-secondary)]">
                            {changeLabel}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
