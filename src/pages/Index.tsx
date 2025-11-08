import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts'
import { format } from 'date-fns'
import { Banknote, Landmark, Package, Percent, ShoppingBag } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from '@/components/ui/chart'
import {
  amendments,
  getAmendmentDetails,
  DetailedAmendment,
} from '@/lib/mock-data'
import { formatCurrencyBRL, formatPercent } from '@/lib/utils'
import { PendingItemsSidebar } from '@/components/dashboard/PendingItemsSidebar'
import { FinancialSummary } from '@/components/dashboard/FinancialSummary'

const Index = () => {
  const dashboardData = useMemo(() => {
    const allDetailedAmendments = amendments
      .map((a) => getAmendmentDetails(a.id))
      .filter((d): d is DetailedAmendment => !!d)

    const allDespesas = allDetailedAmendments.flatMap((a) => a.despesas)
    const allRepasses = allDetailedAmendments.flatMap((a) => a.repasses)

    const totalPropostas = amendments.length
    const totalValor = amendments.reduce((sum, a) => sum + a.valor_total, 0)
    const totalRepassado = amendments.reduce(
      (sum, a) => sum + a.total_repassado,
      0,
    )
    const totalGasto = amendments.reduce((sum, a) => sum + a.total_gasto, 0)
    const execucaoMedia =
      totalRepassado > 0 ? (totalGasto / totalRepassado) * 100 : 0
    const coberturaMedia = totalValor > 0 ? (totalGasto / totalValor) * 100 : 0

    const kpis = [
      { title: 'Total de Propostas', value: totalPropostas, icon: Package },
      {
        title: 'Valor Total',
        value: formatCurrencyBRL(totalValor),
        icon: Landmark,
      },
      {
        title: 'Valor Repassado',
        value: formatCurrencyBRL(totalRepassado),
        icon: Banknote,
      },
      {
        title: 'Valor Gasto',
        value: formatCurrencyBRL(totalGasto),
        icon: ShoppingBag,
      },
      {
        title: 'Execução Média',
        value: formatPercent(execucaoMedia),
        icon: Percent,
      },
      {
        title: 'Cobertura Média',
        value: formatPercent(coberturaMedia),
        icon: Percent,
      },
    ]

    const gastoPorResponsavel = allDespesas.reduce(
      (acc, { registrada_por, valor }) => {
        acc[registrada_por] = (acc[registrada_por] || 0) + valor
        return acc
      },
      {} as Record<string, number>,
    )
    const gastoPorResponsavelData = Object.entries(gastoPorResponsavel).map(
      ([name, value]) => ({ name, value }),
    )

    const monthlyData = [...allRepasses, ...allDespesas].reduce(
      (acc, item) => {
        const month = format(new Date(item.data), 'yyyy-MM')
        if (!acc[month]) acc[month] = { month, repasses: 0, despesas: 0 }
        if ('fonte' in item) acc[month].repasses += item.valor
        else acc[month].despesas += item.valor
        return acc
      },
      {} as Record<
        string,
        { month: string; repasses: number; despesas: number }
      >,
    )
    const lineChartData = Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month),
    )

    return {
      kpis,
      gastoPorResponsavelData,
      lineChartData,
      allDetailedAmendments,
    }
  }, [])

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-asplan-deep">
            Quadro Geral das Emendas — 2025
          </h1>
          <p className="text-muted-foreground">
            Planejamento e acompanhamento financeiro da Secretaria de Saúde
            (ASPLAN)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dashboardData.kpis.map((kpi) => (
            <Card
              key={kpi.title}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-3 md:p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-shrink-0">
                  <kpi.icon className="h-6 w-6 text-asplan-blue-neutral" />
                </div>
                <div className="text-right min-w-0">
                  <p className="text-xs text-neutral-500">{kpi.title}</p>
                  <div className="flex justify-end items-center h-full max-w-full overflow-hidden">
                    <p className="text-2xl sm:text-xl font-semibold text-asplan-deep text-right tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                      {kpi.value}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card className="bg-white rounded-2xl shadow-sm p-4 border border-neutral-200">
            <h3 className="text-lg font-semibold text-asplan-deep mb-3">
              Repasses x Despesas por Mês
            </h3>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <LineChart data={dashboardData.lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => formatCurrencyBRL(val)} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(val) => formatCurrencyBRL(Number(val))}
                      className="tabular-nums"
                    />
                  }
                />
                <ChartLegend />
                <Line
                  type="monotone"
                  dataKey="repasses"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="despesas"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </Card>
          <Card className="bg-white rounded-2xl shadow-sm p-4 border border-neutral-200">
            <h3 className="text-lg font-semibold text-asplan-deep mb-3">
              Gasto por Responsável
            </h3>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart data={dashboardData.gastoPorResponsavelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => formatCurrencyBRL(val)} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(val) => formatCurrencyBRL(Number(val))}
                      className="tabular-nums"
                    />
                  }
                />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ChartContainer>
          </Card>
        </div>
        <FinancialSummary amendments={amendments} />
      </div>
      <div className="sticky top-20">
        <PendingItemsSidebar amendments={dashboardData.allDetailedAmendments} />
      </div>
    </div>
  )
}

export default Index
