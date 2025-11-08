import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
        'text-2xl font-bold text-neutral-900 tabular-nums',
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
    if (executionPercentage === 100) return 'text-[#16A34A]'
    if (executionPercentage >= 50) return 'text-[#D97706]'
    return 'text-[#DC2626]'
  }, [executionPercentage])

  return (
    <Card className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-4">
      <CardHeader className="p-2">
        <CardTitle className="text-base font-semibold text-asplan-deep">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-3">
        <SummaryItem
          label="Valor total previsto"
          value={formatCurrencyBRL(totalValue)}
        />
        <Separator />
        <SummaryItem
          label="Valor já pago"
          value={formatCurrencyBRL(paidValue)}
        />
        <Separator />
        <SummaryItem
          label="Valor pendente"
          value={formatCurrencyBRL(pendingValue)}
        />
        <Separator />
        <SummaryItem
          label="Percentual de execução"
          value={formatPercent(executionPercentage)}
          className={percentageColor}
        />
      </CardContent>
    </Card>
  )
}
