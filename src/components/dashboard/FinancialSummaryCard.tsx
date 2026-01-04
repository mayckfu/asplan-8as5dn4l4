import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrencyBRL, formatPercent } from '@/lib/utils'
import { ArrowRight, Wallet, PieChart, AlertCircle } from 'lucide-react'

interface FinancialSummaryCardProps {
  title: string
  totalValue: number
  paidValue: number
  pendingValue: number
  type: 'MAC' | 'PAP'
  progressLabel?: string
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
}: FinancialSummaryCardProps) => {
  const executionPercentage = useMemo(() => {
    return totalValue > 0 ? (paidValue / totalValue) * 100 : 0
  }, [totalValue, paidValue])

  const linkTo = useMemo(() => {
    if (type === 'MAC') return '/propostas/mac'
    if (type === 'PAP') return '/propostas/pap'
    return '#'
  }, [type])

  const theme = useMemo(() => {
    switch (type) {
      case 'MAC':
        return {
          progressColor: 'bg-blue-600',
          iconBgColor: 'bg-blue-50 text-blue-600',
          paidColor: 'text-blue-700',
          pendingColor: 'text-orange-600',
          Icon: Wallet,
        }
      case 'PAP':
        return {
          progressColor: 'bg-cyan-600',
          iconBgColor: 'bg-cyan-50 text-cyan-600',
          paidColor: 'text-cyan-700',
          pendingColor: 'text-orange-600',
          Icon: PieChart,
        }
    }
  }, [type])

  return (
    <Link
      to={linkTo}
      className="block group transition-all duration-300 hover:-translate-y-1"
    >
      <Card className="h-full bg-white shadow-card hover:shadow-float transition-all border-border/60 rounded-xl overflow-hidden flex flex-col">
        <CardHeader className="pb-4 border-b border-neutral-100 bg-neutral-50/30">
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
                  Recursos de Custeio
                </span>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-white border border-neutral-200 group-hover:border-brand-200 group-hover:bg-brand-50 transition-colors">
              <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-brand-600 transition-colors" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 flex-1 flex flex-col justify-between">
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
      </Card>
    </Link>
  )
}
