import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DetailedAmendment } from '@/lib/mock-data'
import { formatCurrencyBRL, formatPercent } from '@/lib/utils'
import { Wallet, PiggyBank, Receipt, Scale } from 'lucide-react'

interface EmendaQuadroDemonstrativoTabProps {
  emenda: DetailedAmendment
}

export const EmendaQuadroDemonstrativoTab = ({
  emenda,
}: EmendaQuadroDemonstrativoTabProps) => {
  const {
    valor_total,
    total_repassado,
    total_gasto,
    portaria,
    autor,
    numero_proposta,
    numero_emenda,
  } = emenda

  const saldo_atual = total_repassado - total_gasto
  const execution_percentage =
    valor_total > 0 ? (total_gasto / valor_total) * 100 : 0

  // Progress bar should be capped at 100 for display, but calculation is raw
  const progressValue = Math.min(execution_percentage, 100)

  const summaryCards = [
    {
      title: 'Valor Total',
      value: valor_total,
      icon: Wallet,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Recebido',
      value: total_repassado,
      icon: PiggyBank,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Gasto',
      value: total_gasto,
      icon: Receipt,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Saldo Atual',
      value: saldo_atual,
      icon: Scale,
      color: saldo_atual >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: saldo_atual >= 0 ? 'bg-emerald-50' : 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="border border-neutral-200 dark:border-neutral-800 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrencyBRL(card.value)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Execução Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              Progresso de Execução (Gasto vs. Total)
            </span>
            <span className="font-bold">
              {formatPercent(execution_percentage)}
            </span>
          </div>
          <Progress value={progressValue} className="h-3" />
          <p className="text-xs text-muted-foreground">
            Representa o percentual do valor total da emenda que já foi
            executado (gasto).
          </p>
        </CardContent>
      </Card>

      <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Informações Administrativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Número da Proposta
              </p>
              <p className="text-base font-semibold">
                {numero_proposta || '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Número da Emenda
              </p>
              <p className="text-base font-semibold">{numero_emenda || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Autor</p>
              <p className="text-base font-semibold">{autor || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Portaria
              </p>
              <p className="text-base font-semibold">{portaria || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
