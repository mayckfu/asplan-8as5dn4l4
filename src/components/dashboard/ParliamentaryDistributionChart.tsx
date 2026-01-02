import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyBRL, cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ParliamentaryDistributionChartProps {
  data: { name: string; value: number }[]
  periodKey: string
  className?: string
}

const COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
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

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0)

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
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Left Column: Chart */}
          <div className="p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-neutral-100">
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
                      innerRadius={60}
                      outerRadius={90}
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
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Sem emendas para o período selecionado
                </div>
              )}
            </ChartContainer>
          </div>

          {/* Right Column: List */}
          <ScrollArea className="h-[350px] lg:h-auto">
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Parlamentar</span>
                <span>Valor Total</span>
              </div>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors border border-transparent hover:border-neutral-200"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span
                        className="text-sm font-medium text-brand-900 truncate"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold tabular-nums text-brand-700">
                        {formatCurrencyBRL(item.value)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {((item.value / totalValue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
