import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
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

interface ParliamentaryDistributionChartProps {
  data: { name: string; value: number }[]
  periodKey: string
  className?: string
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function ParliamentaryDistributionChart({
  data,
  periodKey,
  className,
}: ParliamentaryDistributionChartProps) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      value: { label: 'Valor' },
    }
    data.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: COLORS[index % COLORS.length],
      }
    })
    return config
  }, [data])

  return (
    <Card
      className={cn(
        'bg-card border-border/50 shadow-sm rounded-xl animate-fade-in-up opacity-0',
        className,
      )}
      style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-asplan-deep">
          Distribuição por Parlamentar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          key={periodKey}
          config={chartConfig}
          className="w-full h-[300px] [&_.recharts-pie-label-text]:fill-foreground"
        >
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      nameKey="name"
                      hideLabel={false}
                      formatter={(value, name) => (
                        <div className="flex min-w-[150px] items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor:
                                chartConfig[name as string]?.color,
                            }}
                          />
                          <span className="font-medium text-foreground truncate max-w-[120px]">
                            {name}
                          </span>
                          <span className="ml-auto tabular-nums text-foreground font-mono">
                            {formatCurrencyBRL(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Legend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Sem emendas para o período selecionado
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
