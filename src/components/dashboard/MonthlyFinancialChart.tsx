import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
    color: 'hsl(var(--chart-2))',
  },
  despesas: {
    label: 'Despesas',
    color: 'hsl(var(--chart-1))',
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
        'bg-card border-border/50 shadow-sm rounded-xl animate-fade-in-up opacity-0',
        className,
      )}
      style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-asplan-deep">
          Repasses x Despesas por Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <ChartContainer
          key={periodKey}
          config={chartConfig}
          className="w-full h-[300px]"
        >
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
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
                  animationDuration={1000}
                />
                <Line
                  type="monotone"
                  dataKey="despesas"
                  name="Despesas"
                  stroke="var(--color-despesas)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
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
  )
}
