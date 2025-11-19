import { useMemo, useEffect, useState } from 'react'
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
import {
  Banknote,
  Landmark,
  Package,
  Percent,
  ShoppingBag,
  Activity,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { DetailedAmendment, Amendment } from '@/lib/mock-data'
import { formatCurrencyBRL, formatPercent } from '@/lib/utils'
import { PendingItemsSidebar } from '@/components/dashboard/PendingItemsSidebar'
import { FinancialSummary } from '@/components/dashboard/FinancialSummary'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

const Index = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [amendments, setAmendments] = useState<Amendment[]>([])
  const [detailedAmendments, setDetailedAmendments] = useState<
    DetailedAmendment[]
  >([])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch basic amendments
      const { data: emendasData, error: emendasError } = await supabase
        .from('emendas')
        .select('*')

      if (emendasError) throw emendasError

      // Fetch related data for details
      const { data: repassesData, error: repassesError } = await supabase
        .from('repasses')
        .select('*')

      if (repassesError) throw repassesError

      const { data: despesasData, error: despesasError } = await supabase
        .from('despesas')
        .select('*, profiles:registrada_por(name)')

      if (despesasError) throw despesasError

      const { data: anexosData, error: anexosError } = await supabase
        .from('anexos')
        .select('*, profiles:uploader(name)')

      if (anexosError) throw anexosError

      // Transform data to match DetailedAmendment type
      const detailed: DetailedAmendment[] = (emendasData || []).map(
        (emenda: any) => {
          const emendaRepasses = (repassesData || []).filter(
            (r: any) => r.emenda_id === emenda.id,
          )
          const emendaDespesas = (despesasData || []).filter(
            (d: any) => d.emenda_id === emenda.id,
          )
          const emendaAnexos = (anexosData || []).filter(
            (a: any) => a.emenda_id === emenda.id,
          )

          // Map despesas to include profile name
          const mappedDespesas = emendaDespesas.map((d: any) => ({
            ...d,
            registrada_por: d.profiles?.name || 'Desconhecido',
          }))

          // Map anexos to include uploader name
          const mappedAnexos = emendaAnexos.map((a: any) => ({
            ...a,
            uploader: a.profiles?.name || 'Desconhecido',
          }))

          return {
            ...emenda,
            repasses: emendaRepasses,
            despesas: mappedDespesas,
            anexos: mappedAnexos,
            historico: [],
            pendencias: [],
          }
        },
      )

      setAmendments(emendasData as Amendment[])
      setDetailedAmendments(detailed)
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message || 'Erro ao carregar dados.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const dashboardData = useMemo(() => {
    const allDespesas = detailedAmendments.flatMap((a) => a.despesas)
    const allRepasses = detailedAmendments.flatMap((a) => a.repasses)

    const totalPropostas = amendments.length
    const totalValor = amendments.reduce((sum, a) => sum + a.valor_total, 0)
    const realTotalRepassado = allRepasses.reduce(
      (sum, r) => (r.status === 'REPASSADO' ? sum + r.valor : sum),
      0,
    )

    const totalGasto = allDespesas.reduce((sum, d) => sum + d.valor, 0)

    const execucaoMedia =
      realTotalRepassado > 0 ? (totalGasto / realTotalRepassado) * 100 : 0
    const coberturaMedia = totalValor > 0 ? (totalGasto / totalValor) * 100 : 0

    const kpis = [
      {
        title: 'Total de Propostas',
        value: totalPropostas,
        icon: Package,
        description: 'Propostas cadastradas',
        trend: 'neutral',
      },
      {
        title: 'Valor Total',
        value: formatCurrencyBRL(totalValor),
        icon: Landmark,
        description: 'Montante global previsto',
        trend: 'up',
      },
      {
        title: 'Valor Repassado',
        value: formatCurrencyBRL(realTotalRepassado),
        icon: Banknote,
        description: 'Recursos recebidos',
        trend: 'up',
      },
      {
        title: 'Valor Gasto',
        value: formatCurrencyBRL(totalGasto),
        icon: ShoppingBag,
        description: 'Despesas executadas',
        trend: 'down',
      },
      {
        title: 'Execução Média',
        value: formatPercent(execucaoMedia),
        icon: Activity,
        description: '% do valor repassado',
        trend: execucaoMedia > 70 ? 'up' : 'neutral',
      },
      {
        title: 'Cobertura Média',
        value: formatPercent(coberturaMedia),
        icon: Percent,
        description: '% do valor total',
        trend: coberturaMedia > 50 ? 'up' : 'neutral',
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
        if ('fonte' in item) {
          if (item.status === 'REPASSADO') acc[month].repasses += item.valor
        } else acc[month].despesas += item.valor
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
      allDetailedAmendments: detailedAmendments,
    }
  }, [amendments, detailedAmendments])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchData}>Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start pb-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-asplan-deep">
            Quadro Geral das Emendas — 2025
          </h1>
          <p className="text-muted-foreground text-lg">
            Planejamento e acompanhamento financeiro da Secretaria de Saúde
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {dashboardData.kpis.map((kpi) => (
            <Card
              key={kpi.title}
              className="bg-card border-border/50 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {kpi.title}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <kpi.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-asplan-deep tabular-nums">
                  {kpi.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-asplan-deep flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Resumo Financeiro
          </h2>
          <FinancialSummary amendments={amendments} />
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-asplan-deep">
                Repasses x Despesas por Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
              <ChartContainer config={{}} className="w-full h-[300px]">
                <LineChart
                  data={dashboardData.lineChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <YAxis
                    tickFormatter={(val) =>
                      new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        compactDisplay: 'short',
                        style: 'currency',
                        currency: 'BRL',
                      }).format(val)
                    }
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(val) => formatCurrencyBRL(Number(val))}
                        className="tabular-nums"
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="repasses"
                    name="Repasses"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    name="Despesas"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-asplan-deep">
                Gasto por Responsável
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {dashboardData.gastoPorResponsavelData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          strokeWidth={0}
                        />
                      ),
                    )}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="sticky top-24">
        <PendingItemsSidebar amendments={dashboardData.allDetailedAmendments} />
      </div>
    </div>
  )
}

export default Index
