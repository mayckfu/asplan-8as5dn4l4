import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrencyBRL, formatPercent } from '@/lib/utils'
import { ArrowRight, Wallet } from 'lucide-react'
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
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {label}
    </p>
    <div className="flex items-baseline gap-2">
      <p
        className={cn(
          'text-lg font-semibold text-foreground tabular-nums',
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

  const cardColorClass =
    type === 'MAC'
      ? 'border-l-4 border-l-asplan-action'
      : 'border-l-4 border-l-asplan-primary'

  return (
    <Link
      to={linkTo}
      className="block group transition-all duration-200 hover:-translate-y-1"
    >
      <Card
        className={cn(
          'h-full bg-card shadow-sm hover:shadow-md transition-shadow border-border/50',
          cardColorClass,
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  type === 'MAC'
                    ? 'bg-asplan-action/10 text-asplan-action'
                    : 'bg-asplan-primary/10 text-asplan-primary',
                )}
              >
                <Wallet className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-asplan-deep">
                {title}
              </CardTitle>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Execução</span>
              <span className="font-medium text-foreground">
                {formatPercent(executionPercentage)}
              </span>
            </div>
            <Progress
              value={executionPercentage}
              className="h-2"
              indicatorClassName={
                type === 'MAC' ? 'bg-asplan-action' : 'bg-asplan-primary'
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SummaryItem
              label="Total Previsto"
              value={formatCurrencyBRL(totalValue)}
            />
            <SummaryItem
              label="Já Pago"
              value={formatCurrencyBRL(paidValue)}
              className="text-success"
            />
            <SummaryItem
              label="Pendente"
              value={formatCurrencyBRL(pendingValue)}
              className="text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
