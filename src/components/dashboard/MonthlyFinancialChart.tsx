import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyBRL, cn } from '@/lib/utils'

interface MonthlyFinancialChartProps {
  data: { month: string; repasses: number; despesas: number }[]
  periodKey: string
  className?: string
}

const chartConfig = {
  repasses: {
    label: 'Repasses',
    color: '#0ea5e9', // Sky 500 / Brand 500
  },
  despesas: {
    label: 'Despesas',
    color: '#f43f5e', // Rose 500
  },
} satisfies ChartConfig

export function MonthlyFinancialChart({
  data,
  periodKey,
  className,
}: MonthlyFinancialChartProps) {
  return (
    <Card
      className={cn(
        'bg-white border-border/50 shadow-card rounded-xl animate-fade-in-up opacity-0 overflow-hidden',
        className,
      )}
      style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
    >
      <CardHeader className="border-b border-neutral-100 bg-neutral-50/30 pb-4">
        <CardTitle className="text-lg font-bold text-brand-900">
          Evolução Financeira (Mensal)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pl-0">
        <ChartContainer
          key={periodKey}
          config={chartConfig}
          className="w-full h-[320px]"
        >
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="fillRepasses" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-repasses)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-repasses)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tickFormatter={(value) => value.slice(5)}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
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
                  tickMargin={12}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(val) => formatCurrencyBRL(Number(val))}
                      className="tabular-nums shadow-lg border-brand-100"
                    />
                  }
                />
                <Legend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="repasses"
                  name="Repasses"
                  fill="url(#fillRepasses)"
                  stroke="var(--color-repasses)"
                  strokeWidth={3}
                  activeDot={{
                    r: 6,
                    strokeWidth: 0,
                    fill: 'var(--color-repasses)',
                  }}
                  animationDuration={1500}
                />
                <Line
                  type="monotone"
                  dataKey="despesas"
                  name="Despesas"
                  stroke="var(--color-despesas)"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                    fill: '#fff',
                    strokeWidth: 2,
                    stroke: 'var(--color-despesas)',
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 0,
                    fill: 'var(--color-despesas)',
                  }}
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Sem dados para o período selecionado
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
