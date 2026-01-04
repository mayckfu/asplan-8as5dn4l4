import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyBRL, cn, abbreviateName } from '@/lib/utils'
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
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
]

export function ParliamentaryDistributionChart({
  data,
  periodKey,
  className,
}: ParliamentaryDistributionChartProps) {
  // Process data to get top 6 active legislators
  const processedData = useMemo(() => {
    // Sort by value descending
    const sorted = [...data].sort((a, b) => b.value - a.value)

    // Take top 6
    const top6 = sorted.slice(0, 6)

    // Ensure we have at least some data, otherwise return empty
    if (top6.length === 0) return []

    return top6
  }, [data])

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      value: { label: 'Valor' },
    }
    processedData.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: COLORS[index % COLORS.length],
      }
    })
    return config
  }, [processedData])

  const totalValue = processedData.reduce((acc, curr) => acc + curr.value, 0)

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
        <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
          {/* Left Column: Chart (Takes 3 columns on desktop) */}
          <div className="p-4 lg:col-span-3 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-neutral-100 min-h-[300px]">
            <ChartContainer
              key={periodKey}
              config={chartConfig}
              className="w-full h-[250px] lg:h-[300px] [&_.recharts-pie-label-text]:fill-foreground"
            >
              {processedData.length > 0 ? (
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
                      data={processedData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70} // Make it a Donut chart
                      outerRadius={90}
                      paddingAngle={3}
                      cornerRadius={4}
                    >
                      {processedData.map((entry, index) => (
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
                  Sem dados
                </div>
              )}
            </ChartContainer>
          </div>

          {/* Right Column: Legend List (Takes 2 columns) */}
          <div className="lg:col-span-2 h-[300px] lg:h-auto flex flex-col bg-neutral-50/50">
            <div className="p-3 border-b border-neutral-100 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Top {processedData.length} Parlamentares
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {processedData.length > 0 ? (
                  processedData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-neutral-200 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span
                          className="font-medium text-brand-900 truncate"
                          title={item.name}
                        >
                          {abbreviateName(item.name)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-2">
                        <span className="font-bold tabular-nums text-brand-700">
                          {formatCurrencyBRL(item.value)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {totalValue > 0
                            ? ((item.value / totalValue) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-8">
                    Nenhum dado
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
