import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrencyBRL, formatPercent } from '@/lib/utils'

interface FinancialSummaryCardProps {
  title: string
  totalValue: number
  paidValue: number
}

const SummaryItem = ({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) => (
  <div>
    <p className="text-sm text-neutral-500">{label}</p>
    <p
      className={cn(
        'text-base font-medium text-neutral-800 tabular-nums',
        className,
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
}: FinancialSummaryCardProps) => {
  const { pendingValue, executionPercentage } = useMemo(() => {
    const pending = totalValue - paidValue
    const percentage = totalValue > 0 ? (paidValue / totalValue) * 100 : 0
    return { pendingValue: pending, executionPercentage: percentage }
  }, [totalValue, paidValue])

  const percentageColor = useMemo(() => {
    if (executionPercentage === 100) return 'text-success'
    if (executionPercentage >= 50) return 'text-warning'
    return 'text-destructive'
  }, [executionPercentage])

  const linkTo = useMemo(() => {
    if (title === 'Incremento MAC') return '/propostas/mac'
    if (title === 'Incremento PAP') return '/propostas/pap'
    return '#'
  }, [title])

  return (
    <Link
      to={linkTo}
      className="block rounded-xl transition-all hover:shadow-md hover:-translate-y-1"
    >
      <Card className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm h-full">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-base font-semibold text-asplan-deep">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          <SummaryItem
            label="Valor total previsto"
            value={formatCurrencyBRL(totalValue)}
          />
          <SummaryItem
            label="Valor já pago"
            value={formatCurrencyBRL(paidValue)}
          />
          <SummaryItem
            label="Valor pendente"
            value={formatCurrencyBRL(pendingValue)}
          />
          <SummaryItem
            label="Percentual de execução"
            value={formatPercent(executionPercentage)}
            className={percentageColor}
          />
        </CardContent>
      </Card>
    </Link>
  )
}
