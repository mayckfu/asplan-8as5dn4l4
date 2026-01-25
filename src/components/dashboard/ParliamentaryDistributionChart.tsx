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
  // Process data to get top active legislators
  const processedData = useMemo(() => {
    // Sort by value descending
    const sorted = [...data].sort((a, b) => b.value - a.value)

    // Take top 8 for a better list view
    const top = sorted.slice(0, 8)

    if (top.length === 0) return []

    return top
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
        <div className="grid grid-cols-1 lg:grid-cols-5 h-full min-h-[350px]">
          {/* Left Column: Chart (Takes 2 columns on desktop for better balance) */}
          <div className="p-4 lg:col-span-2 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-neutral-100 min-h-[300px]">
            <ChartContainer
              key={periodKey}
              config={chartConfig}
              className="w-full h-[220px] lg:h-[260px] [&_.recharts-pie-label-text]:fill-foreground"
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
                      innerRadius={60}
                      outerRadius={80}
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

          {/* Right Column: Legend List (Takes 3 columns) */}
          <div className="lg:col-span-3 flex flex-col bg-white">
            <div className="p-3 border-b border-neutral-100 bg-neutral-50/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
              <span>Top {processedData.length} Parlamentares</span>
              <span>Total: {formatCurrencyBRL(totalValue)}</span>
            </div>
            <ScrollArea className="flex-1 max-h-[400px]">
              <div className="p-2 space-y-1">
                {processedData.length > 0 ? (
                  processedData.map((item, index) => (
                    <div
                      key={index}
                      // Use explicit grid columns for perfect alignment
                      // 1. Color (auto/fixed)
                      // 2. Name (1fr)
                      // 3. Value (fixed width right aligned)
                      // 4. Percentage (fixed width right aligned)
                      className="group grid grid-cols-[20px_1fr_110px_60px] items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all text-sm"
                    >
                      {/* Color Indicator */}
                      <div className="flex items-center justify-center">
                        <div
                          className="h-3 w-3 rounded-full shadow-sm ring-2 ring-white shrink-0"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>

                      {/* Name with Bar */}
                      <div className="min-w-0 flex flex-col">
                        <span
                          className="font-medium text-neutral-900 truncate"
                          title={item.name}
                        >
                          {abbreviateName(item.name)}
                        </span>
                        <div className="h-1 w-full bg-neutral-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.value / processedData[0].value) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                              opacity: 0.7,
                            }}
                          />
                        </div>
                      </div>

                      {/* Currency Value (Fixed Width & Aligned) */}
                      <div className="text-right shrink-0">
                        <span className="font-bold tabular-nums text-neutral-900 block">
                          {formatCurrencyBRL(item.value)}
                        </span>
                      </div>

                      {/* Percentage (Fixed Width & Aligned) */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-medium text-muted-foreground bg-neutral-100 px-1.5 py-0.5 rounded-md inline-block min-w-[36px] text-center">
                          {totalValue > 0
                            ? ((item.value / totalValue) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-12">
                    Nenhum dado disponível
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
