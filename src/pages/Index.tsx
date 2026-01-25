import { useMemo, useEffect, useState, useCallback } from 'react'
import { parseISO, getMonth, format } from 'date-fns'
import { Banknote, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { DetailedAmendment, Amendment, Pendencia } from '@/lib/mock-data'
import { PendingItemsSidebar } from '@/components/dashboard/PendingItemsSidebar'
import { FinancialSummary } from '@/components/dashboard/FinancialSummary'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PeriodSelector } from '@/components/PeriodSelector'
import { KPICards } from '@/components/KPICards'
import { MonthlyFinancialChart } from '@/components/dashboard/MonthlyFinancialChart'
import { ParliamentaryDistributionChart } from '@/components/dashboard/ParliamentaryDistributionChart'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const Index = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { session, isAuthenticated } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amendments, setAmendments] = useState<Amendment[]>([])
  const [detailedAmendments, setDetailedAmendments] = useState<
    DetailedAmendment[]
  >([])

  // Filters State with persistence
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const saved = localStorage.getItem('asplan_dashboard_year')
    return saved || new Date().getFullYear().toString()
  })
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  // Persist year selection
  useEffect(() => {
    localStorage.setItem('asplan_dashboard_year', selectedYear)
  }, [selectedYear])

  const fetchData = useCallback(
    async (forceLoading = false) => {
      if (!session && !isAuthenticated) return // Protected route handles redirect, but guard here

      if (forceLoading) setIsLoading(true)
      else setIsRefetching(true)

      setError(null)

      try {
        // Filter by Fiscal Year (ano_exercicio)
        let query = supabase.from('emendas').select('*')

        if (selectedYear) {
          query = query.eq('ano_exercicio', parseInt(selectedYear))
        }

        const { data: emendasData, error: emendasError } = await query

        if (emendasError) {
          if (
            emendasError.code === '42501' ||
            emendasError.message.includes('policy')
          ) {
            throw new Error(
              'Acesso negado. Você não tem permissão para visualizar estes dados.',
            )
          }
          throw emendasError
        }

        // Even if no data, we should set state to empty arrays to clear the dashboard
        if (!emendasData || emendasData.length === 0) {
          setAmendments([])
          setDetailedAmendments([])
          setIsLoading(false)
          setIsRefetching(false)
          return
        }

        const emendaIds = emendasData.map((e) => e.id)

        // Parallel fetching for performance
        const [repassesRes, despesasRes, anexosRes, pendenciasRes] =
          await Promise.all([
            supabase.from('repasses').select('*').in('emenda_id', emendaIds),
            supabase
              .from('despesas')
              .select('*, profiles:registrada_por(name)')
              .in('emenda_id', emendaIds),
            supabase
              .from('anexos')
              .select('*, profiles:uploader(name)')
              .in('emenda_id', emendaIds),
            supabase.from('pendencias').select('*').in('emenda_id', emendaIds),
          ])

        if (repassesRes.error) throw repassesRes.error
        if (despesasRes.error) throw despesasRes.error
        if (anexosRes.error) throw anexosRes.error
        if (pendenciasRes.error) throw pendenciasRes.error

        const repassesData = repassesRes.data || []
        const despesasData = despesasRes.data || []
        const anexosData = anexosRes.data || []
        const pendenciasData = pendenciasRes.data || []

        const detailed: DetailedAmendment[] = (emendasData || []).map(
          (emenda: any) => {
            const emendaRepasses = repassesData.filter(
              (r: any) => r.emenda_id === emenda.id,
            )
            const emendaDespesas = despesasData.filter(
              (d: any) => d.emenda_id === emenda.id,
            )
            const emendaAnexos = anexosData.filter(
              (a: any) => a.emenda_id === emenda.id,
            )
            const emendaPendencias = pendenciasData
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
        toast({
          title: 'Erro de conexão',
          description:
            error.message || 'Não foi possível carregar os dados do painel.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
        setIsRefetching(false)
      }
    },
    [selectedYear, session, isAuthenticated, toast],
  )

  // Initial fetch and Realtime Subscriptions
  useEffect(() => {
    if (isAuthenticated) {
      fetchData(true)

      const channel = supabase
        .channel('dashboard-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'emendas' },
          () => fetchData(),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'repasses' },
          () => fetchData(),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'despesas' },
          () => fetchData(),
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchData, isAuthenticated])

  const { periodFilteredData } = useMemo(() => {
    const month = selectedMonth === 'all' ? null : parseInt(selectedMonth)

    // Helper: Filter by month
    const filterByMonth = (dateString: string) => {
      if (!dateString) return false
      const date = parseISO(dateString)
      if (month !== null) {
        return getMonth(date) + 1 === month
      }
      return true
    }

    // Apply Period Filters (Year is already applied by API, this applies Month)
    // We use this dataset for all charts and summary cards
    const periodFilteredAmendments = amendments

    // For detailed view, we need repasses and despesas filtered by month
    const allRepasses = detailedAmendments.flatMap((a) => a.repasses)
    const allDespesas = detailedAmendments.flatMap((a) => a.despesas)

    const periodFilteredRepasses = allRepasses.filter((r) =>
      filterByMonth(r.data),
    )
    const periodFilteredDespesas = allDespesas.filter((d) =>
      filterByMonth(d.data),
    )

    const periodData = {
      amendments: periodFilteredAmendments,
      repasses: periodFilteredRepasses,
      despesas: periodFilteredDespesas,
      detailedAmendments: detailedAmendments,
    }

    return {
      periodFilteredData: periodData,
    }
  }, [amendments, detailedAmendments, selectedMonth])

  const dashboardData = useMemo(() => {
    const {
      amendments: fAmendments,
      repasses: fRepasses,
      despesas: fDespesas,
    } = periodFilteredData

    const totalValor = fAmendments.reduce((sum, a) => sum + a.valor_total, 0)
    // Only count filtered despesas (by month if selected)
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
      allDetailedAmendments: periodFilteredData.detailedAmendments,
    }
  }, [periodFilteredData])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Carregando painel...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-6 p-6 text-center">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Erro ao carregar dados
          </h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
        <Button onClick={() => fetchData(true)} size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  const periodKey = `${selectedYear}-${selectedMonth}`

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start pb-8">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-asplan-deep flex items-center gap-3">
              Dashboard — Exercício {selectedYear}
              {isRefetching && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
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
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-semibold text-asplan-deep flex items-center gap-2 animate-fade-in opacity-0"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              <Banknote className="h-5 w-5" />
              Resumo Financeiro
            </h2>
          </div>
          <FinancialSummary
            amendments={periodFilteredData.amendments}
            repasses={periodFilteredData.repasses}
            despesas={periodFilteredData.despesas}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <MonthlyFinancialChart
            data={dashboardData.lineChartData}
            periodKey={periodKey}
          />

          <ParliamentaryDistributionChart
            data={dashboardData.gastoPorResponsavelData}
            periodKey={periodKey}
          />
        </div>
      </div>
      {/* Sidebar */}
      <div className="hidden lg:block sticky top-24">
        <PendingItemsSidebar amendments={dashboardData.allDetailedAmendments} />
      </div>
    </div>
  )
}

export default Index
