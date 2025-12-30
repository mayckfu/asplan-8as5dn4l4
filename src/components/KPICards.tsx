import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyBRL, formatPercent, cn } from '@/lib/utils'
import { TrendingUp, Users, Wallet } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface KPICardsProps {
  totalValue: number
  executedValue: number
  activeLegislators: number
}

export function KPICards({
  totalValue,
  executedValue,
  activeLegislators,
}: KPICardsProps) {
  const executionPercentage =
    totalValue > 0 ? (executedValue / totalValue) * 100 : 0

  const cardClass =
    'overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-muted/30 animate-fade-in-up opacity-0'

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card
        className={cardClass}
        style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
      >
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet className="h-24 w-24 text-primary" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Valor Total de Emendas
            </p>
            <h2 className="text-3xl font-bold tabular-nums text-foreground mt-2">
              {formatCurrencyBRL(totalValue)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Montante global previsto no período
            </p>
          </div>
        </CardContent>
      </Card>

      <Card
        className={cardClass}
        style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
      >
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <TrendingUp className="h-24 w-24 text-success" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex justify-between items-center pr-8">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Executado vs. Planejado
              </p>
              <span className="text-sm font-bold text-success">
                {formatPercent(executionPercentage)}
              </span>
            </div>
            <h2 className="text-3xl font-bold tabular-nums text-foreground mt-2">
              {formatCurrencyBRL(executedValue)}
            </h2>
            <div className="mt-3 pr-4">
              <Progress value={executionPercentage} className="h-2 bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className={cardClass}
        style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
      >
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Users className="h-24 w-24 text-asplan-action" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Legisladores Ativos
            </p>
            <h2 className="text-3xl font-bold tabular-nums text-foreground mt-2">
              {activeLegislators}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Parlamentares com emendas no período
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
