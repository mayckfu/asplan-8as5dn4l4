import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrencyBRL, formatPercent } from '@/lib/utils'
import { ArrowRight, Wallet, PieChart, Package } from 'lucide-react'

interface FinancialSummaryCardProps {
  title: string
  totalValue: number
  paidValue: number
  pendingValue: number
  type: 'MAC' | 'PAP' | 'EQUIPAMENTO'
  progressLabel?: string
  isActive?: boolean
  onClick?: () => void
}

const SummaryItem = ({
  label,
  value,
  className,
  colorClass,
}: {
  label: string
  value: string
  className?: string
  colorClass?: string
}) => (
  <div
    className={cn(
      'flex flex-col p-3 rounded-lg bg-neutral-50 border border-neutral-100/50',
      className,
    )}
  >
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
      {label}
    </p>
    <p
      className={cn(
        'text-sm font-bold tabular-nums',
        colorClass || 'text-neutral-900',
      )}
    >
      {value}
    </p>
  </div>
)

export const FinancialSummaryCard = ({
  title,
  totalValue,
  paidValue,
  pendingValue,
  type,
  progressLabel = 'Execução Financeira',
  isActive,
  onClick,
}: FinancialSummaryCardProps) => {
  const executionPercentage = useMemo(() => {
    return totalValue > 0 ? (paidValue / totalValue) * 100 : 0
  }, [totalValue, paidValue])

  const theme = useMemo(() => {
    switch (type) {
      case 'MAC':
        return {
          progressColor: 'bg-blue-600',
          iconBgColor: 'bg-blue-50 text-blue-600',
          paidColor: 'text-blue-700',
          pendingColor: 'text-orange-600',
          borderColor: 'border-blue-200 ring-blue-100',
          Icon: Wallet,
        }
      case 'PAP':
        return {
          progressColor: 'bg-cyan-600',
          iconBgColor: 'bg-cyan-50 text-cyan-600',
          paidColor: 'text-cyan-700',
          pendingColor: 'text-orange-600',
          borderColor: 'border-cyan-200 ring-cyan-100',
          Icon: PieChart,
        }
      case 'EQUIPAMENTO':
        return {
          progressColor: 'bg-orange-500',
          iconBgColor: 'bg-orange-50 text-orange-600',
          paidColor: 'text-orange-700',
          pendingColor: 'text-red-600',
          borderColor: 'border-orange-200 ring-orange-100',
          Icon: Package,
        }
    }
  }, [type])

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    const commonClasses = cn(
      'h-full bg-white shadow-card hover:shadow-float transition-all duration-300 border rounded-xl overflow-hidden flex flex-col relative',
      isActive
        ? cn('ring-4 ring-offset-2', theme.borderColor)
        : 'border-border/60 hover:-translate-y-1',
    )

    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={cn('w-full text-left', commonClasses)}
        >
          {children}
        </button>
      )
    }

    // Fallback to Link if no onClick provided (backward compatibility)
    const linkTo =
      type === 'MAC'
        ? '/propostas/mac'
        : type === 'PAP'
          ? '/propostas/pap'
          : '#'
    return (
      <Link to={linkTo} className={cn('block group', commonClasses)}>
        {children}
      </Link>
    )
  }

  return (
    <CardWrapper>
      <CardHeader className="pb-4 border-b border-neutral-100 bg-neutral-50/30 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2.5 rounded-xl shadow-sm border border-white',
                theme.iconBgColor,
              )}
            >
              <theme.Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-lg font-bold text-brand-900">
                {title}
              </CardTitle>
              <span className="text-xs text-muted-foreground font-medium">
                {type === 'EQUIPAMENTO'
                  ? 'Recursos de Capital'
                  : 'Recursos de Custeio'}
              </span>
            </div>
          </div>
          <div
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center bg-white border border-neutral-200 transition-colors',
              isActive
                ? 'bg-brand-50 border-brand-200 text-brand-600'
                : 'text-neutral-400 group-hover:text-brand-600 group-hover:bg-brand-50 group-hover:border-brand-200',
            )}
          >
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 flex-1 flex flex-col justify-between w-full">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wide">
            <span className="text-muted-foreground">{progressLabel}</span>
            <span className="text-brand-700">
              {formatPercent(executionPercentage)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-1000 ease-out rounded-full',
                theme.progressColor,
              )}
              style={{ width: `${executionPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryItem
            label="Total Previsto"
            value={formatCurrencyBRL(totalValue)}
          />
          <SummaryItem
            label="Liquidado"
            value={formatCurrencyBRL(paidValue)}
            colorClass={theme.paidColor}
          />
          <SummaryItem
            label="Pendente"
            value={formatCurrencyBRL(pendingValue)}
            colorClass={theme.pendingColor}
          />
        </div>
      </CardContent>
    </CardWrapper>
  )
}
