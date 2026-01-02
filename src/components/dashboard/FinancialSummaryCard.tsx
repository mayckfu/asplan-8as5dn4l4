import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrencyBRL, formatPercent } from '@/lib/utils'
import { ArrowRight, Wallet, PieChart } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface FinancialSummaryCardProps {
  title: string
  totalValue: number
  paidValue: number
  type: 'MAC' | 'PAP'
}

const SummaryItem = ({
  label,
  value,
  className,
  subValue,
}: {
  label: string
  value: string
  className?: string
  subValue?: string
}) => (
  <div className="flex flex-col">
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
      {label}
    </p>
    <div className="flex items-baseline gap-2">
      <p
        className={cn(
          'text-lg font-bold text-brand-900 tabular-nums',
          className,
        )}
      >
        {value}
      </p>
      {subValue && (
        <span className="text-xs text-muted-foreground">{subValue}</span>
      )}
    </div>
  </div>
)

export const FinancialSummaryCard = ({
  title,
  totalValue,
  paidValue,
  type,
}: FinancialSummaryCardProps) => {
  const { pendingValue, executionPercentage } = useMemo(() => {
    const pending = totalValue - paidValue
    const percentage = totalValue > 0 ? (paidValue / totalValue) * 100 : 0
    return { pendingValue: pending, executionPercentage: percentage }
  }, [totalValue, paidValue])

  const linkTo = useMemo(() => {
    if (type === 'MAC') return '/propostas/mac'
    if (type === 'PAP') return '/propostas/pap'
    return '#'
  }, [type])

  // Colors for progress bars as per requirements: blue-600 and cyan-600
  const progressColor = type === 'MAC' ? 'bg-blue-600' : 'bg-cyan-600'
  const iconBgColor =
    type === 'MAC' ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'

  return (
    <Link
      to={linkTo}
      className="block group transition-all duration-300 hover:-translate-y-1"
    >
      <Card className="h-full bg-white shadow-card hover:shadow-float transition-all border-border/60 rounded-xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-neutral-100 bg-neutral-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2.5 rounded-xl shadow-sm border border-white',
                  iconBgColor,
                )}
              >
                {type === 'MAC' ? (
                  <Wallet className="h-5 w-5" />
                ) : (
                  <PieChart className="h-5 w-5" />
                )}
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
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wide">
              <span className="text-muted-foreground">Execução Financeira</span>
              <span className="text-brand-700">
                {formatPercent(executionPercentage)}
              </span>
            </div>
            <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-1000 ease-out rounded-full',
                  progressColor,
                )}
                style={{ width: `${executionPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 p-4 bg-neutral-50/50 rounded-lg border border-neutral-100/50">
            <SummaryItem
              label="Total Previsto"
              value={formatCurrencyBRL(totalValue)}
            />
            <SummaryItem
              label="Liquidado"
              value={formatCurrencyBRL(paidValue)}
              className="text-emerald-600"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
