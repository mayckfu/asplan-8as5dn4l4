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
  LabelList,
} from 'recharts'
import { format, parseISO, getYear, getMonth } from 'date-fns'
import {
  Banknote,
  Landmark,
  Package,
  Percent,
  ShoppingBag,
  Activity,
  Loader2,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DetailedAmendment, Amendment, Pendencia } from '@/lib/mock-data'
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

  // Filters State
  const [selectedYear, setSelectedYear] = useState<string>('2025')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: emendasData, error: emendasError } = await supabase
        .from('emendas')
        .select('*')

      if (emendasError) throw emendasError

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

      const { data: pendenciasData, error: pendenciasError } = await supabase
        .from('pendencias')
        .select('*')

      if (pendenciasError) throw pendenciasError

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
          const emendaPendencias = (pendenciasData || [])
            .filter((p: any) => p.emenda_id === emenda.id)
            .map((p: any) => ({
              id: p.id,
              descricao: p.descricao,
              dispensada: p.dispensada,
              resolvida: p.resolvida,
              justificativa: p.justificativa,
              targetType: p.target_type,
              targetId: p.target_id,
            }))

          const mappedDespesas = emendaDespesas.map((d: any) => ({
            ...d,
            registrada_por: d.profiles?.name || 'Desconhecido',
          }))

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
            pendencias: emendaPendencias as Pendencia[],
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

  const filteredData = useMemo(() => {
    const year = parseInt(selectedYear)
    const month = selectedMonth === 'all' ? null : parseInt(selectedMonth)

    const filterByDate = (dateString: string) => {
      if (!dateString) return false
      const date = parseISO(dateString)
      const matchesYear = getYear(date) === year
      if (month !== null) {
        return matchesYear && getMonth(date) + 1 === month
      }
      return matchesYear
    }

    const filteredAmendmentsList = amendments.filter((a) =>
      filterByDate(a.created_at),
    )
    const filteredDetailedAmendments = detailedAmendments.filter((a) =>
      filterByDate(a.created_at),
    )

    const allRepasses = detailedAmendments.flatMap((a) => a.repasses)
    const allDespesas = detailedAmendments.flatMap((a) => a.despesas)

    const filteredRepasses = allRepasses.filter((r) => filterByDate(r.data))
    const filteredDespesas = allDespesas.filter((d) => filterByDate(d.data))

    return {
      amendments: filteredAmendmentsList,
      detailedAmendments: filteredDetailedAmendments,
      repasses: filteredRepasses,
      despesas: filteredDespesas,
    }
  }, [amendments, detailedAmendments, selectedYear, selectedMonth])

  const dashboardData = useMemo(() => {
    const {
      amendments: fAmendments,
      repasses: fRepasses,
      despesas: fDespesas,
    } = filteredData

    const totalPropostas = fAmendments.length
    const totalValor = fAmendments.reduce((sum, a) => sum + a.valor_total, 0)
    const realTotalRepassado = fRepasses.reduce(
      (sum, r) => (r.status === 'REPASSADO' ? sum + r.valor : sum),
      0,
    )

    const totalGasto = fDespesas.reduce((sum, d) => sum + d.valor, 0)

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

    // Chart: Budget Distribution by Parliamentarian (supporting co-authorship)
    const budgetByParlamentar = fAmendments.reduce(
      (acc, amendment) => {
        const primary = amendment.parlamentar || 'Não Informado'
        const secondary = amendment.segundo_parlamentar
        const secondaryValue = amendment.valor_segundo_responsavel || 0
        const primaryValue = amendment.valor_total - secondaryValue

        acc[primary] = (acc[primary] || 0) + primaryValue

        if (secondary && secondaryValue > 0) {
          acc[secondary] = (acc[secondary] || 0) + secondaryValue
        }

        return acc
      },
      {} as Record<string, number>,
    )

    const gastoPorResponsavelData = Object.entries(budgetByParlamentar)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const monthlyData = [...fRepasses, ...fDespesas].reduce(
      (acc, item) => {
        const month = format(parseISO(item.data), 'yyyy-MM')
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
      allDetailedAmendments: filteredData.detailedAmendments,
    }
  }, [filteredData])

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-asplan-deep">
              Quadro Geral — {selectedYear}
            </h1>
            <p className="text-muted-foreground text-lg">
              Acompanhamento financeiro da Secretaria de Saúde
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Meses</SelectItem>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
          <FinancialSummary amendments={filteredData.amendments} />
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
                {dashboardData.lineChartData.length > 0 ? (
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
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    Sem dados para o período selecionado
                  </div>
                )}
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-asplan-deep">
                Distribuição por Parlamentar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="w-full h-[300px]">
                {dashboardData.gastoPorResponsavelData.length > 0 ? (
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
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
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
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    Sem emendas para o período selecionado
                  </div>
                )}
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
