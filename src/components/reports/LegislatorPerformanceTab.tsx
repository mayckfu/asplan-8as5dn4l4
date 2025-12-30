import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
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
import { formatCurrencyBRL } from '@/lib/utils'

interface LegislatorPerformanceTabProps {
  consolidatedByAutor: { name: string; value: number }[]
  executionByParlamentarAndResponsavel: any[]
}

const chartConfig = {
  value: {
    label: 'Valor',
    color: 'hsl(var(--chart-1))',
  },
  totalExecuted: {
    label: 'Total Executado',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function LegislatorPerformanceTab({
  consolidatedByAutor,
  executionByParlamentarAndResponsavel,
}: LegislatorPerformanceTabProps) {
  return (
    <div className="grid gap-6">
      <Card className="rounded-xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Top Autores por Volume de Recursos</CardTitle>
          <CardDescription>
            Valores totais destinados por parlamentar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-[400px]">
            <BarChart
              data={consolidatedByAutor.slice(0, 10)}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <defs>
                <linearGradient id="colorAutor" x1="0" y1="0" x2="1" y2="0">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} />
              <XAxis
                type="number"
                tickFormatter={(v) =>
                  new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(v)
                }
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrencyBRL(Number(value))}
                    className="tabular-nums"
                  />
                }
                cursor={{ fill: 'transparent' }}
              />
              <Bar
                dataKey="value"
                fill="url(#colorAutor)"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Execução Detalhada por Parlamentar</CardTitle>
          <CardDescription>
            Recursos executados divididos por responsável
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-[500px]">
            <BarChart
              data={executionByParlamentarAndResponsavel}
              layout="vertical"
              margin={{ left: 0 }}
            >
              <defs>
                <linearGradient id="colorExecPar" x1="0" y1="0" x2="1" y2="0">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.4}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} />
              <XAxis
                type="number"
                tickFormatter={(v) =>
                  new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(v)
                }
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="parlamentar"
                width={150}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrencyBRL(Number(value))}
                    className="tabular-nums"
                  />
                }
                cursor={{ fill: 'transparent' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="totalExecuted"
                name="Total Executado"
                fill="url(#colorExecPar)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
