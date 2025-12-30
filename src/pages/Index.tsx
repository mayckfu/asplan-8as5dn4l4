import { useMemo, useEffect, useState, useCallback } from 'react'
import {
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO, getYear, getMonth } from 'date-fns'
import { Banknote, Loader2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from '@/components/ui/chart'
import { DetailedAmendment, Amendment, Pendencia } from '@/lib/mock-data'
import { formatCurrencyBRL } from '@/lib/utils'
import { PendingItemsSidebar } from '@/components/dashboard/PendingItemsSidebar'
import { FinancialSummary } from '@/components/dashboard/FinancialSummary'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PeriodSelector } from '@/components/PeriodSelector'
import { KPICards } from '@/components/KPICards'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

const chartConfig = {
  repasses: {
    label: 'Repasses',
    color: 'hsl(var(--chart-2))',
  },
  despesas: {
    label: 'Despesas',
    color: 'hsl(var(--chart-1))',
  },
  value: {
    label: 'Valor',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

const Index = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [amendments, setAmendments] = useState<Amendment[]>([])
  const [detailedAmendments, setDetailedAmendments] = useState<
    DetailedAmendment[]
  >([])

  // Filters State
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  )
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase.from('emendas').select('*')

      if (selectedYear) {
        const start = `${selectedYear}-01-01`
        const end = `${selectedYear}-12-31 23:59:59`
        query = query.gte('created_at', start).lte('created_at', end)
      }

      const { data: emendasData, error: emendasError } = await query

      if (emendasError) throw emendasError

      if (!emendasData || emendasData.length === 0) {
        setAmendments([])
        setDetailedAmendments([])
        setIsLoading(false)
        return
      }

      const emendaIds = emendasData.map((e) => e.id)

      const { data: repassesData, error: repassesError } = await supabase
        .from('repasses')
        .select('*')
        .in('emenda_id', emendaIds)

      if (repassesError) throw repassesError

      const { data: despesasData, error: despesasError } = await supabase
        .from('despesas')
        .select('*, profiles:registrada_por(name)')
        .in('emenda_id', emendaIds)

      if (despesasError) throw despesasError

      const { data: anexosData, error: anexosError } = await supabase
        .from('anexos')
        .select('*, profiles:uploader(name)')
        .in('emenda_id', emendaIds)

      if (anexosError) throw anexosError

      const { data: pendenciasData, error: pendenciasError } = await supabase
        .from('pendencias')
        .select('*')
        .in('emenda_id', emendaIds)

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
  }, [selectedYear])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

    // Since we already fetched by year, we mostly just filter by month here if selected
    const filterByMonth = (dateString: string) => {
      if (!dateString) return false
      const date = parseISO(dateString)
      if (month !== null) {
        return getMonth(date) + 1 === month
      }
      return true
    }

    const filteredAmendmentsList = amendments.filter((a) =>
      filterByMonth(a.created_at),
    )
    const filteredDetailedAmendments = detailedAmendments.filter((a) =>
      filterByMonth(a.created_at),
    )

    const allRepasses = detailedAmendments.flatMap((a) => a.repasses)
    const allDespesas = detailedAmendments.flatMap((a) => a.despesas)

    const filteredRepasses = allRepasses.filter((r) => filterByMonth(r.data))
    const filteredDespesas = allDespesas.filter((d) => filterByMonth(d.data))

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

    const totalValor = fAmendments.reduce((sum, a) => sum + a.valor_total, 0)
    const totalGasto = fDespesas.reduce((sum, d) => sum + d.valor, 0)
    const activeLegislators = new Set(fAmendments.map((a) => a.parlamentar))
      .size

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
        const date = parseISO(item.data)
        const monthStr = format(date, 'yyyy-MM')
        if (!acc[monthStr])
          acc[monthStr] = { month: monthStr, repasses: 0, despesas: 0 }
        if ('fonte' in item) {
          if (item.status === 'REPASSADO') acc[monthStr].repasses += item.valor
        } else acc[monthStr].despesas += item.valor
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
      kpiValues: {
        totalValue: totalValor,
        executedValue: totalGasto,
        activeLegislators,
      },
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
              Dashboard — {selectedYear}
            </h1>
            <p className="text-muted-foreground text-lg">
              Acompanhamento financeiro da Secretaria de Saúde
            </p>
          </div>
          <PeriodSelector
            year={selectedYear}
            month={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
        </div>

        <KPICards
          totalValue={dashboardData.kpiValues.totalValue}
          executedValue={dashboardData.kpiValues.executedValue}
          activeLegislators={dashboardData.kpiValues.activeLegislators}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-asplan-deep flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Resumo Financeiro
          </h2>
          <FinancialSummary amendments={filteredData.amendments} />
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card className="bg-card border-border/50 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-asplan-deep">
                Repasses x Despesas por Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
              <ChartContainer config={chartConfig} className="w-full h-[300px]">
                {dashboardData.lineChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
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
                      <Tooltip
                        content={
                          <ChartTooltipContent
                            formatter={(val) => formatCurrencyBRL(Number(val))}
                            className="tabular-nums"
                          />
                        }
                      />
                      <Legend content={<ChartLegendContent />} />
                      <Line
                        type="monotone"
                        dataKey="repasses"
                        name="Repasses"
                        stroke="var(--color-repasses)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="despesas"
                        name="Despesas"
                        stroke="var(--color-despesas)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    Sem dados para o período selecionado
                  </div>
                )}
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-asplan-deep">
                Distribuição por Parlamentar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="w-full h-[300px] [&_.recharts-pie-label-text]:fill-foreground"
              >
                {dashboardData.gastoPorResponsavelData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => {
                              const total =
                                dashboardData.gastoPorResponsavelData.reduce(
                                  (acc, entry) => acc + entry.value,
                                  0,
                                )
                              const percent = (Number(value) / total) * 100
                              return `${formatCurrencyBRL(Number(value))} (${percent.toFixed(1)}%)`
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
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
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
                      <Legend
                        content={<ChartLegendContent />}
                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
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
