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
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
} from '@/lib/mock-data'

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
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF4560',
]

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
    // Apply filters here (omitted for brevity, but would be similar to EmendasListPage)
    return allDetailedAmendments
  }, [filters])

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

  const executionByUnidade = useMemo(() => {
    const data = filteredData
      .flatMap((a) => a.despesas)
      .reduce(
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
  }, [filteredData])

  const executionStatus = useMemo(() => {
    const data = filteredData
      .flatMap((a) => a.despesas)
      .reduce(
        (acc, item) => {
          acc[item.status_execucao] =
            (acc[item.status_execucao] || 0) + item.valor
          return acc
        },
        {} as Record<string, number>,
      )
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <Button size="sm" variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Collapsible defaultOpen>
            <div className="flex items-center justify-between">
              <CardTitle>Filtros</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Consolidado por Autor</CardTitle>
            <CardDescription>
              Valor total das emendas por autor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart
                data={consolidatedByAutor}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(val) => `R$${Number(val) / 1000}k`}
                />
                <YAxis type="category" dataKey="name" width={100} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(val) =>
                        `R$ ${Number(val).toLocaleString('pt-BR')}`
                      }
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Execução por Unidade</CardTitle>
            <CardDescription>
              Valor total gasto por unidade de destino.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart
                data={executionByUnidade}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(val) => `R$${Number(val) / 1000}k`}
                />
                <YAxis type="category" dataKey="name" width={100} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(val) =>
                        `R$ ${Number(val).toLocaleString('pt-BR')}`
                      }
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--chart-2))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status de Execução das Despesas</CardTitle>
            <CardDescription>
              Distribuição do valor das despesas por status.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={{}} className="w-full h-[300px]">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(val) =>
                        `R$ ${Number(val).toLocaleString('pt-BR')}`
                      }
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
                  {executionStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RelatoriosPage
