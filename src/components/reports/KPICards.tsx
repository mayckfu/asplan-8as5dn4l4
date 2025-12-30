import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyBRL, formatPercent } from '@/lib/utils'
import { TrendingUp, Users, Wallet } from 'lucide-react'

interface KPICardsProps {
  totalValue: number
  executionPercentage: number
  activeLegislators: number
}

export function KPICards({
  totalValue,
  executionPercentage,
  activeLegislators,
}: KPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="overflow-hidden border-l-4 border-l-asplan-primary shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Valor Total
            </p>
            <div className="h-8 w-8 rounded-full bg-asplan-primary/10 group-hover:bg-asplan-primary/20 flex items-center justify-center text-asplan-primary transition-colors">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-2xl font-bold tabular-nums text-foreground">
              {formatCurrencyBRL(totalValue)}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total em emendas filtradas
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-success shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Execução
            </p>
            <div className="h-8 w-8 rounded-full bg-success/10 group-hover:bg-success/20 flex items-center justify-center text-success transition-colors">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-2xl font-bold tabular-nums text-foreground">
              {formatPercent(executionPercentage)}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Progresso financeiro (Despesas/Total)
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-asplan-action shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Parlamentares
            </p>
            <div className="h-8 w-8 rounded-full bg-asplan-action/10 group-hover:bg-asplan-action/20 flex items-center justify-center text-asplan-action transition-colors">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-2xl font-bold tabular-nums text-foreground">
              {activeLegislators}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Autores ativos no período
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
