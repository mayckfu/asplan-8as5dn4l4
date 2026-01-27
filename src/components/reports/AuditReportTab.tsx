import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { DetailedAmendment } from '@/lib/mock-data'
import { formatCurrencyBRL } from '@/lib/utils'

interface AuditReportTabProps {
  data: DetailedAmendment[]
}

const chartConfig = {
  planned: {
    label: 'Planejado',
    color: 'hsl(var(--chart-1))',
  },
  executed: {
    label: 'Executado',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
]

export const AuditReportTab = ({ data }: AuditReportTabProps) => {
  // Aggregate data for charts
  const destinationSummary = data
    .flatMap((d) => d.acoes.flatMap((a) => a.destinacoes))
    .reduce(
      (acc, dest) => {
        acc[dest.tipo_destinacao] =
          (acc[dest.tipo_destinacao] || 0) + dest.valor_destinado
        return acc
      },
      {} as Record<string, number>,
    )

  const destinationChartData = Object.entries(destinationSummary).map(
    ([name, value]) => ({ name, value }),
  )

  const actionComparison = data
    .flatMap((d) => d.acoes)
    .map((action) => {
      const planned = action.destinacoes.reduce(
        (acc, dest) => acc + dest.valor_destinado,
        0,
      )
      // Find expenses linked to this action's destinations
      const destinationIds = action.destinacoes.map((d) => d.id)
      const emenda = data.find((d) => d.id === action.emenda_id)
      const executed =
        emenda?.despesas
          .filter(
            (d) => d.destinacao_id && destinationIds.includes(d.destinacao_id),
          )
          .reduce((acc, d) => acc + d.valor, 0) || 0

      return {
        name: action.nome_acao,
        planned,
        executed,
      }
    })
    .sort((a, b) => b.planned - a.planned)
    .slice(0, 10)

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Destinação (Planejado)</CardTitle>
            <CardDescription>
              Distribuição dos recursos por tipo de destinação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
              <PieChart>
                <Pie
                  data={destinationChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {destinationChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) => formatCurrencyBRL(Number(v))}
                    />
                  }
                />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execução por Ação (Top 10)</CardTitle>
            <CardDescription>
              Planejado vs Executado nas principais ações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
              <BarChart
                data={actionComparison}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  fontSize={12}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(v) =>
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                    }).format(v)
                  }
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) => formatCurrencyBRL(Number(v))}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="planned"
                  name="Planejado"
                  fill="var(--color-planned)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="executed"
                  name="Executado"
                  fill="var(--color-executed)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão de Auditoria Detalhada</CardTitle>
          <CardDescription>
            Hierarquia completa: Emenda {'>'} Ação {'>'} Destinação {'>'}{' '}
            Despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Emenda / Ação</TableHead>
                  <TableHead className="w-[20%]">Destinação</TableHead>
                  <TableHead className="w-[15%] text-right">
                    Valor Planejado
                  </TableHead>
                  <TableHead className="w-[15%] text-right">
                    Valor Executado
                  </TableHead>
                  <TableHead className="w-[20%]">Detalhe Despesas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((emenda) =>
                  emenda.acoes.map((acao) =>
                    acao.destinacoes.map((dest, destIndex) => {
                      const expenses = emenda.despesas.filter(
                        (d) => d.destinacao_id === dest.id,
                      )
                      const executedVal = expenses.reduce(
                        (acc, d) => acc + d.valor,
                        0,
                      )
                      return (
                        <TableRow key={dest.id}>
                          <TableCell className="align-top">
                            {destIndex === 0 && (
                              <div>
                                <div className="font-bold">
                                  {emenda.numero_emenda} - {emenda.autor}
                                </div>
                                <div className="pl-4 text-sm text-muted-foreground">
                                  ↳ {acao.nome_acao}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="text-sm font-medium">
                              {dest.tipo_destinacao}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {dest.portaria_vinculada}
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-right">
                            {formatCurrencyBRL(dest.valor_destinado)}
                          </TableCell>
                          <TableCell className="align-top text-right">
                            <span
                              className={
                                executedVal > dest.valor_destinado
                                  ? 'text-red-500 font-bold'
                                  : ''
                              }
                            >
                              {formatCurrencyBRL(executedVal)}
                            </span>
                          </TableCell>
                          <TableCell className="align-top">
                            {expenses.length > 0 ? (
                              <div className="space-y-1">
                                {expenses.map((exp) => (
                                  <div
                                    key={exp.id}
                                    className="text-xs border-l-2 pl-2 border-muted"
                                  >
                                    <div>{formatCurrencyBRL(exp.valor)}</div>
                                    <div className="text-muted-foreground">
                                      {exp.fornecedor_nome}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    }),
                  ),
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
