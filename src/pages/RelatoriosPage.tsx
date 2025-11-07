import { useState, useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
  Tooltip,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  ReportsFilters,
  ReportFiltersState,
} from '@/components/reports/ReportsFilters'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ListFilter, FileDown } from 'lucide-react'
import {
  amendments,
  getAmendmentDetails,
  DetailedAmendment,
  TipoRecurso,
  SituacaoOficial,
} from '@/lib/mock-data'
import { formatCurrencyBRL } from '@/lib/utils'

const initialFilters: ReportFiltersState = {
  autor: '',
  tipoRecurso: 'all',
  situacao: 'all',
  statusInterno: 'all',
  periodo: undefined,
  valorMin: '',
  valorMax: '',
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

const exportToCsv = (filename: string, rows: object[]) => {
  if (!rows || rows.length === 0) {
    alert('Nenhum dado para exportar.')
    return
  }
  const separator = ','
  const keys = Object.keys(rows[0])
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row: any) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k]
            cell =
              cell instanceof Date
                ? cell.toLocaleString()
                : cell.toString().replace(/"/g, '""')
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`
            }
            return cell
          })
          .join(separator)
      })
      .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const RelatoriosPage = () => {
  const [filters, setFilters] = useState<ReportFiltersState>(initialFilters)

  const handleFilterChange = (newFilters: Partial<ReportFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
  }

  const filteredData = useMemo(() => {
    const allDetailedAmendments = amendments
      .map((a) => getAmendmentDetails(a.id))
      .filter((d): d is DetailedAmendment => !!d)

    return allDetailedAmendments.filter((amendment) => {
      if (
        filters.autor &&
        !amendment.autor.toLowerCase().includes(filters.autor.toLowerCase())
      )
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
      if (
        filters.valorMin &&
        amendment.valor_total < parseFloat(filters.valorMin)
      )
        return false
      if (
        filters.valorMax &&
        amendment.valor_total > parseFloat(filters.valorMax)
      )
        return false
      if (filters.periodo?.from) {
        const amendmentDate = new Date(amendment.created_at)
        if (amendmentDate < filters.periodo.from) return false
        if (filters.periodo.to && amendmentDate > filters.periodo.to)
          return false
      }

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
  }, [filters])

  const allDespesas = useMemo(
    () => filteredData.flatMap((a) => a.despesas),
    [filteredData],
  )

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

  const executionByDemanda = useMemo(() => {
    const data = allDespesas.reduce(
      (acc, item) => {
        const key = item.demanda || 'Sem Demanda'
        acc[key] = (acc[key] || 0) + item.valor
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">
          Relatórios
        </h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => alert('Gerando relatório em PDF...')}
        >
          <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <Collapsible defaultOpen>
            <div className="flex items-center justify-between">
              <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
                Filtros
              </CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ListFilter className="h-4 w-4" />
                  <span className="sr-only">Filtros</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-4">
              <ReportsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Consolidado por Autor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart data={consolidatedByAutor} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCurrencyBRL(v)}
                />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={formatCurrencyBRL}
                      className="tabular-nums"
                    />
                  }
                />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCsv('consolidado_autor.csv', consolidatedByAutor)
              }
            >
              Exportar CSV
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Consolidado por Tipo de Recurso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <PieChart>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={formatCurrencyBRL}
                      className="tabular-nums"
                    />
                  }
                />
                <Pie
                  data={consolidatedByTipoRecurso}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {consolidatedByTipoRecurso.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCsv(
                  'consolidado_recurso.csv',
                  consolidatedByTipoRecurso,
                )
              }
            >
              Exportar CSV
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Consolidado por Situação Oficial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart data={consolidatedBySituacao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(v) => formatCurrencyBRL(v)} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={formatCurrencyBRL}
                      className="tabular-nums"
                    />
                  }
                />
                <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCsv('consolidado_situacao.csv', consolidatedBySituacao)
              }
            >
              Exportar CSV
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Execução por Responsável (Lançamento)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart data={executionByResponsavel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCurrencyBRL(v)}
                />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={formatCurrencyBRL}
                      className="tabular-nums"
                    />
                  }
                />
                <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCsv('execucao_responsavel.csv', executionByResponsavel)
              }
            >
              Exportar CSV
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Execução por Unidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart data={executionByUnidade} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCurrencyBRL(v)}
                />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={formatCurrencyBRL}
                      className="tabular-nums"
                    />
                  }
                />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCsv('execucao_unidade.csv', executionByUnidade)
              }
            >
              Exportar CSV
            </Button>
          </CardFooter>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Execução por Demanda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart data={executionByDemanda} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCurrencyBRL(v)}
                />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={formatCurrencyBRL}
                      className="tabular-nums"
                    />
                  }
                />
                <Bar dataKey="value" fill="hsl(var(--chart-5))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCsv('execucao_demanda.csv', executionByDemanda)
              }
            >
              Exportar CSV
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Status de Execução das Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="w-full h-[300px]">
              <PieChart>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={formatCurrencyBRL}
                      className="tabular-nums"
                    />
                  }
                />
                <Pie
                  data={executionStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {executionStatus.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportToCsv('execucao_status.csv', executionStatus)
              }
            >
              Exportar CSV
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default RelatoriosPage
