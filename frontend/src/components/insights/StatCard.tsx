import { formatSalary } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number
  format?: 'currency' | 'number'
  description?: string
  className?: string
}

const formatValue = (value: number, format: 'currency' | 'number'): string => {
  if (format === 'currency') return formatSalary(value)
  return new Intl.NumberFormat('en-US').format(value)
}

export function StatCard({
  label,
  value,
  format = 'currency',
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 space-y-1 shadow-sm',
        className
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tracking-tight">
        {formatValue(value, format)}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}