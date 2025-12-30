import { useState, useMemo, useEffect } from 'react'
import {
  Loader2,
  FileDown,
  LayoutDashboard,
  Users,
  TrendingUp,
} from 'lucide-react'
import {
  DetailedAmendment,
  TipoRecurso,
  SituacaoOficial,
} from '@/lib/mock-data'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ReportsFilters,
  ReportFiltersState,
} from '@/components/reports/ReportsFilters'
import { PeriodSelector } from '@/components/PeriodSelector'
import { KPICards } from '@/components/KPICards'
import { FinancialOverviewTab } from '@/components/reports/FinancialOverviewTab'
import { LegislatorPerformanceTab } from '@/components/reports/LegislatorPerformanceTab'
import { ExecutionDetailsTab } from '@/components/reports/ExecutionDetailsTab'

const currentYear = new Date().getFullYear().toString()

const initialFilters: ReportFiltersState = {
  autor: '',
  tipo: 'all',
  tipoRecurso: 'all',
  situacao: 'all',
  statusInterno: 'all',
  year: currentYear,
  month: 'all',
  valorMin: 0,
  valorMax: 0,
  responsavel: '',
  unidade: '',
  demanda: '',
  statusExecucao: 'all',
  fornecedor: '',
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
]

const RelatoriosPage = () => {
  const [filters, setFilters] = useState<ReportFiltersState>(initialFilters)
  const [allData, setAllData] = useState<DetailedAmendment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { data: emendas, error: emendasError } = await supabase
          .from('emendas')
          .select('*')
        if (emendasError) throw emendasError

        const { data: despesas, error: despesasError } = await supabase
          .from('despesas')
          .select('*, profiles:registrada_por(name)')
        if (despesasError) throw despesasError

        const { data: repasses, error: repassesError } = await supabase
          .from('repasses')
          .select('*')
        if (repassesError) throw repassesError

        const detailed: DetailedAmendment[] = (emendas || []).map((e: any) => {
          const emendaDespesas = (despesas || [])
            .filter((d: any) => d.emenda_id === e.id)
            .map((d: any) => ({
              ...d,
              registrada_por: d.profiles?.name || 'Desconhecido',
            }))

          const emendaRepasses = (repasses || []).filter(
            (r: any) => r.emenda_id === e.id,
          )

          return {
            ...e,
            despesas: emendaDespesas,
            repasses: emendaRepasses,
            anexos: [],
            historico: [],
            pendencias: [],
          }
        })

        setAllData(detailed)
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, []) // Fetch once, filter locally for responsiveness

  const filteredData = useMemo(() => {
    return allData.filter((amendment) => {
      // Filter by Year (created_at)
      const amendmentDate = new Date(amendment.created_at)
      const amendmentYear = amendmentDate.getFullYear().toString()
      if (filters.year && amendmentYear !== filters.year) return false

      // Filter by Month
      if (filters.month !== 'all') {
        const amendmentMonth = (amendmentDate.getMonth() + 1).toString()
        if (amendmentMonth !== filters.month) return false
      }

      // Existing Filters
      if (
        filters.autor &&
        !amendment.autor.toLowerCase().includes(filters.autor.toLowerCase())
      )
        return false
      if (filters.tipo !== 'all' && amendment.tipo !== filters.tipo)
        return false
      if (
        filters.tipoRecurso !== 'all' &&
        amendment.tipo_recurso !== filters.tipoRecurso
      )
        return false
      if (filters.situacao !== 'all' && amendment.situacao !== filters.situacao)
        return false
      if (
        filters.statusInterno !== 'all' &&
        amendment.status_interno !== filters.statusInterno
      )
        return false
      if (filters.valorMin && amendment.valor_total < filters.valorMin)
        return false
      if (filters.valorMax && amendment.valor_total > filters.valorMax)
        return false

      const hasDespesaFilters =
        filters.responsavel ||
        filters.unidade ||
        filters.demanda ||
        filters.statusExecucao !== 'all' ||
        filters.fornecedor

      if (hasDespesaFilters) {
        const matchingDespesas = amendment.despesas.filter((despesa) => {
          if (
            filters.responsavel &&
            !despesa.registrada_por
              .toLowerCase()
              .includes(filters.responsavel.toLowerCase())
          )
            return false
          if (
            filters.unidade &&
            !despesa.unidade_destino
              .toLowerCase()
              .includes(filters.unidade.toLowerCase())
          )
            return false
          if (
            filters.demanda &&
            !despesa.demanda
              ?.toLowerCase()
              .includes(filters.demanda.toLowerCase())
          )
            return false
          if (
            filters.statusExecucao !== 'all' &&
            despesa.status_execucao !== filters.statusExecucao
          )
            return false
          if (
            filters.fornecedor &&
            !despesa.fornecedor_nome
              .toLowerCase()
              .includes(filters.fornecedor.toLowerCase())
          )
            return false
          return true
        })
        if (matchingDespesas.length === 0) return false
      }

      return true
    })
  }, [filters, allData])

  // --- Data Processors ---

  const allDespesas = useMemo(
    () => filteredData.flatMap((a) => a.despesas),
    [filteredData],
  )

  const kpiData = useMemo(() => {
    const totalValue = filteredData.reduce(
      (acc, item) => acc + item.valor_total,
      0,
    )
    const totalExecuted = allDespesas.reduce((acc, item) => acc + item.valor, 0)
    const activeLegislators = new Set(filteredData.map((d) => d.parlamentar))
      .size
    // percentage calculated in component

    return { totalValue, totalExecuted, activeLegislators }
  }, [filteredData, allDespesas])

  const consolidatedByAutor = useMemo(() => {
    const data = filteredData.reduce(
      (acc, item) => {
        acc[item.autor] = (acc[item.autor] || 0) + item.valor_total
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  const consolidatedByTipoRecurso = useMemo(() => {
    const data = filteredData.reduce(
      (acc, item) => {
        const name = TipoRecurso[item.tipo_recurso]
        acc[name] = (acc[name] || 0) + item.valor_total
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  const consolidatedBySituacao = useMemo(() => {
    const data = filteredData.reduce(
      (acc, item) => {
        const name = SituacaoOficial[item.situacao]
        acc[name] = (acc[name] || 0) + item.valor_total
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  const executionByResponsavel = useMemo(() => {
    const data = allDespesas.reduce(
      (acc, item) => {
        acc[item.registrada_por] = (acc[item.registrada_por] || 0) + item.valor
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [allDespesas])

  const executionByUnidade = useMemo(() => {
    const data = allDespesas.reduce(
      (acc, item) => {
        acc[item.unidade_destino] =
          (acc[item.unidade_destino] || 0) + item.valor
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [allDespesas])

  const executionStatus = useMemo(() => {
    const data = allDespesas.reduce(
      (acc, item) => {
        acc[item.status_execucao] =
          (acc[item.status_execucao] || 0) + item.valor
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [allDespesas])

  const executionByParlamentarAndResponsavel = useMemo(() => {
    const grouping: Record<string, Record<string, number>> = {}
    filteredData.forEach((emenda) => {
      const parlamentar = emenda.parlamentar || 'Não informado'
      if (!grouping[parlamentar]) grouping[parlamentar] = {}
      emenda.despesas.forEach((despesa) => {
        const responsavel = despesa.registrada_por || 'Desconhecido'
        grouping[parlamentar][responsavel] =
          (grouping[parlamentar][responsavel] || 0) + despesa.valor
      })
    })

    return Object.entries(grouping)
      .map(([parlamentar, responsaveis]) => {
        const totalExecuted = Object.values(responsaveis).reduce(
          (a, b) => a + b,
          0,
        )
        return {
          parlamentar,
          responsaveis: Object.entries(responsaveis).map(([name, value]) => ({
            name,
            value,
          })),
          totalExecuted,
        }
      })
      .sort((a, b) => b.totalExecuted - a.totalExecuted)
  }, [filteredData])

  const handleFilterChange = (newFilters: Partial<ReportFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Carregando dados financeiros...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Painel de Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão estratégica e monitoramento financeiro
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector
            year={filters.year}
            month={filters.month}
            onYearChange={(year) => handleFilterChange({ year })}
            onMonthChange={(month) => handleFilterChange({ month })}
          />
          <Button variant="outline" size="icon" title="Exportar">
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <KPICards
        totalValue={kpiData.totalValue}
        executedValue={kpiData.totalExecuted}
        activeLegislators={kpiData.activeLegislators}
      />

      <ReportsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhum dado encontrado</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            Não há registros para o período ou filtros selecionados. Tente
            ajustar os critérios de busca.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={handleResetFilters}
          >
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="legislators" className="gap-2">
              <Users className="h-4 w-4" /> Parlamentares
            </TabsTrigger>
            <TabsTrigger value="execution" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Execução
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="space-y-6 animate-fade-in-up"
          >
            <FinancialOverviewTab
              consolidatedByTipoRecurso={consolidatedByTipoRecurso}
              consolidatedBySituacao={consolidatedBySituacao}
              executionStatus={executionStatus}
              COLORS={COLORS}
            />
          </TabsContent>

          <TabsContent
            value="legislators"
            className="space-y-6 animate-fade-in-up"
          >
            <LegislatorPerformanceTab
              consolidatedByAutor={consolidatedByAutor}
              executionByParlamentarAndResponsavel={
                executionByParlamentarAndResponsavel
              }
            />
          </TabsContent>

          <TabsContent
            value="execution"
            className="space-y-6 animate-fade-in-up"
          >
            <ExecutionDetailsTab
              executionByResponsavel={executionByResponsavel}
              executionByUnidade={executionByUnidade}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default RelatoriosPage
