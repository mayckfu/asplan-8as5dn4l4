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
  ResponsiveContainer,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { formatCurrencyBRL } from '@/lib/utils'

interface FinancialOverviewTabProps {
  consolidatedByTipoRecurso: { name: string; value: number }[]
  consolidatedBySituacao: { name: string; value: number }[]
  executionStatus: { name: string; value: number }[]
  COLORS: string[]
}

export function FinancialOverviewTab({
  consolidatedByTipoRecurso,
  consolidatedBySituacao,
  executionStatus,
  COLORS,
}: FinancialOverviewTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-1 rounded-xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Consolidado por Tipo de Recurso</CardTitle>
          <CardDescription>Distribuição do valor total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={consolidatedByTipoRecurso}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {consolidatedByTipoRecurso.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={formatCurrencyBRL}
                      className="tabular-nums"
                    />
                  }
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 rounded-xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Status de Execução Geral</CardTitle>
          <CardDescription>Estado atual das despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={executionStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={0}
                >
                  {executionStatus.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 3) % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={formatCurrencyBRL}
                      className="tabular-nums"
                    />
                  }
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 rounded-xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Situação Oficial das Emendas</CardTitle>
          <CardDescription>
            Valores agrupados por status oficial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="w-full h-[350px]">
            <BarChart data={consolidatedBySituacao}>
              <defs>
                <linearGradient id="colorSituacao" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                height={60}
                angle={-15}
                textAnchor="end"
                fontSize={12}
              />
              <YAxis
                tickFormatter={(v) =>
                  new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(v)
                }
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={formatCurrencyBRL}
                    className="tabular-nums"
                  />
                }
                cursor={{ fill: 'transparent' }}
              />
              <Bar
                dataKey="value"
                fill="url(#colorSituacao)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
