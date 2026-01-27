import { Fragment } from 'react'
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
import { Badge } from '@/components/ui/badge'
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
import { formatCurrencyBRL, cn } from '@/lib/utils'
import {
  AlertCircle,
  CornerDownRight,
  Receipt,
  Target,
  FileText,
  CheckCircle2,
} from 'lucide-react'

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
        <Card className="border border-neutral-200 dark:border-neutral-800">
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

        <Card className="border border-neutral-200 dark:border-neutral-800">
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

      <Card className="border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle>Visão de Auditoria Detalhada</CardTitle>
          <CardDescription>
            Acompanhamento hierárquico: Emenda &gt; Ação &gt; Destinação &gt;
            Despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white dark:bg-neutral-950 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[35%]">
                    Hierarquia / Detalhe
                  </TableHead>
                  <TableHead className="w-[20%]">Natureza / Tipo</TableHead>
                  <TableHead className="w-[15%] text-right">
                    Planejado (R$)
                  </TableHead>
                  <TableHead className="w-[15%] text-right">
                    Executado (R$)
                  </TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((emenda) => (
                  <Fragment key={emenda.id}>
                    {/* Emenda Row */}
                    <TableRow className="bg-muted">
                      <TableCell colSpan={5} className="py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 font-bold text-base">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm border border-primary/20">
                              {emenda.numero_emenda}
                            </span>
                            <span>{emenda.autor}</span>
                          </div>
                          {emenda.objeto_emenda && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground pl-1">
                              <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                              <span className="font-medium">Objeto:</span>
                              {emenda.objeto_emenda}
                            </div>
                          )}
                          {emenda.meta_operacional && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground pl-1">
                              <Target className="h-4 w-4 mt-0.5 shrink-0" />
                              <span className="font-medium">Meta:</span>
                              {emenda.meta_operacional}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Actions Loop */}
                    {emenda.acoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <span className="text-muted-foreground italic">
                            Nenhuma ação planejada.
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      emenda.acoes.map((acao) => {
                        const actionPlanned = acao.destinacoes.reduce(
                          (sum, d) => sum + d.valor_destinado,
                          0,
                        )
                        const destinationIds = acao.destinacoes.map((d) => d.id)
                        const actionExpenses = emenda.despesas.filter(
                          (d) =>
                            d.destinacao_id &&
                            destinationIds.includes(d.destinacao_id),
                        )
                        const actionExecuted = actionExpenses.reduce(
                          (sum, d) => sum + d.valor,
                          0,
                        )
                        const isActionOverBudget =
                          actionExecuted > actionPlanned && actionPlanned > 0

                        return (
                          <Fragment key={acao.id}>
                            {/* Action Row */}
                            <TableRow className="bg-muted/10">
                              <TableCell className="font-medium pl-6">
                                <div className="flex items-center gap-2">
                                  <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-primary font-semibold">
                                    Ação:
                                  </span>
                                  {acao.nome_acao}
                                </div>
                                <div className="pl-6 text-xs text-muted-foreground">
                                  Área: {acao.area}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground italic">
                                Total da Ação
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrencyBRL(actionPlanned)}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  'text-right font-medium',
                                  isActionOverBudget ? 'text-red-600' : '',
                                )}
                              >
                                {formatCurrencyBRL(actionExecuted)}
                              </TableCell>
                              <TableCell>
                                {isActionOverBudget && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px]"
                                  >
                                    Acima do Planejado
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>

                            {/* Destinations Loop */}
                            {acao.destinacoes.map((dest) => {
                              const destExpenses = emenda.despesas.filter(
                                (d) => d.destinacao_id === dest.id,
                              )
                              const destExecuted = destExpenses.reduce(
                                (sum, d) => sum + d.valor,
                                0,
                              )
                              const isDestOverBudget =
                                destExecuted > dest.valor_destinado &&
                                dest.valor_destinado > 0

                              return (
                                <Fragment key={dest.id}>
                                  <TableRow>
                                    <TableCell className="pl-12 py-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                                        Destinação Planejada
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <div className="flex flex-col">
                                        <span className="font-medium text-sm">
                                          {dest.tipo_destinacao}
                                        </span>
                                        {dest.subtipo && (
                                          <span className="text-xs text-muted-foreground">
                                            {dest.subtipo}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right py-2">
                                      {formatCurrencyBRL(dest.valor_destinado)}
                                    </TableCell>
                                    <TableCell
                                      className={cn(
                                        'text-right py-2',
                                        isDestOverBudget
                                          ? 'text-red-600 font-bold'
                                          : '',
                                      )}
                                    >
                                      {formatCurrencyBRL(destExecuted)}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      {isDestOverBudget ? (
                                        <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                                          <AlertCircle className="h-3 w-3" />
                                          Excedido
                                        </div>
                                      ) : destExecuted > 0 ? (
                                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Executando
                                        </div>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">
                                          Pendente
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>

                                  {/* Expenses Loop */}
                                  {destExpenses.length > 0 &&
                                    destExpenses.map((exp) => (
                                      <TableRow
                                        key={exp.id}
                                        className="hover:bg-transparent"
                                      >
                                        <TableCell
                                          colSpan={2}
                                          className="pl-16 py-1 border-0"
                                        >
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Receipt className="h-3 w-3" />
                                            <span className="italic">
                                              {exp.descricao}
                                            </span>
                                            <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1 rounded border">
                                              {new Date(
                                                exp.data,
                                              ).toLocaleDateString('pt-BR')}
                                            </span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right py-1 border-0 text-xs text-muted-foreground">
                                          -
                                        </TableCell>
                                        <TableCell className="text-right py-1 border-0 text-xs text-muted-foreground">
                                          {formatCurrencyBRL(exp.valor)}
                                        </TableCell>
                                        <TableCell className="py-1 border-0"></TableCell>
                                      </TableRow>
                                    ))}
                                </Fragment>
                              )
                            })}
                          </Fragment>
                        )
                      })
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
