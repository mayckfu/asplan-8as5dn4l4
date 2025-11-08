import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
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

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {dashboardData.kpis.map((kpi) => (
            <Card
              key={kpi.title}
              className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4"
            >
              <p className="text-sm text-neutral-600">{kpi.title}</p>
              <p className="text-2xl font-semibold text-asplan-deep tabular-nums">
                {kpi.value}
              </p>
            </Card>
          ))}
        </div>

        <FinancialSummary amendments={amendments} />

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
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => {
                        const total =
                          dashboardData.gastoPorResponsavelData.reduce(
                            (acc, entry) => acc + entry.value,
                            0,
                          )
                        const percent = (Number(value) / total) * 100
                        return `${formatCurrencyBRL(
                          Number(value),
                        )} (${percent.toFixed(1)}%)`
                      }}
                      className="tabular-nums"
                    />
                  }
                />
                <Pie
                  data={dashboardData.gastoPorResponsavelData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.5
                    const x =
                      cx + radius * Math.cos(-midAngle * (Math.PI / 180))
                    const y =
                      cy + radius * Math.sin(-midAngle * (Math.PI / 180))
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-xs font-medium"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    )
                  }}
                >
                  {dashboardData.gastoPorResponsavelData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartLegend />
              </PieChart>
            </ChartContainer>
          </Card>
        </div>
      </div>
      <div className="sticky top-20">
        <PendingItemsSidebar amendments={dashboardData.allDetailedAmendments} />
      </div>
    </div>
  )
}

export default Index
