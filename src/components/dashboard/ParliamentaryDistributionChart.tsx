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

// Specific categorical colors as requested: Blue (#3b82f6), Violet (#8b5cf6), Rose (#f43f5e), and Emerald (#10b981).
const COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber (added as 5th backup)
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
        'bg-white border-border/50 shadow-card rounded-xl animate-fade-in-up opacity-0 overflow-hidden',
        className,
      )}
      style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
    >
      <CardHeader className="border-b border-neutral-100 bg-neutral-50/30 pb-4">
        <CardTitle className="text-lg font-bold text-brand-900">
          Distribuição por Parlamentar
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer
          key={periodKey}
          config={chartConfig}
          className="w-full h-[320px] [&_.recharts-pie-label-text]:fill-foreground"
        >
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      nameKey="name"
                      hideLabel={false}
                      className="bg-white shadow-lg border-neutral-200"
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
                  innerRadius={70} // Doughnut style
                  outerRadius={100}
                  paddingAngle={3}
                  cornerRadius={4}
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
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/2 [&>*]:justify-start"
                  verticalAlign="bottom"
                  height={80}
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
