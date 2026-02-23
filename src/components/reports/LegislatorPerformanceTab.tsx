import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
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
import { formatCurrencyBRL, stringToColor } from '@/lib/utils'
import { usePrivacy } from '@/contexts/PrivacyContext'

interface LegislatorPerformanceTabProps {
  consolidatedByParlamentar: { name: string; value: number }[]
  executionByParlamentarAndResponsavel: any[]
}

const chartConfig = {
  value: {
    label: 'Valor Total',
  },
  totalExecuted: {
    label: 'Total Executado',
  },
} satisfies ChartConfig

export function LegislatorPerformanceTab({
  consolidatedByParlamentar,
  executionByParlamentarAndResponsavel,
}: LegislatorPerformanceTabProps) {
  const { isPrivacyMode } = usePrivacy()

  const dataWithColors = useMemo(
    () =>
      consolidatedByParlamentar.slice(0, 15).map((d) => ({
        ...d,
        baseColor: stringToColor(d.name),
      })),
    [consolidatedByParlamentar],
  )

  const execDataWithColors = useMemo(
    () =>
      executionByParlamentarAndResponsavel.slice(0, 15).map((d) => ({
        ...d,
        baseColor: stringToColor(d.parlamentar),
      })),
    [executionByParlamentarAndResponsavel],
  )

  const PREMIUM_CARD_CLASS =
    'rounded-2xl border border-border/40 shadow-lg bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl'

  return (
    <div className="grid gap-6">
      <Card className={PREMIUM_CARD_CLASS}>
        <CardHeader>
          <CardTitle>Top Parlamentares por Volume de Recursos</CardTitle>
          <CardDescription>
            Valores totais destinados agrupados por parlamentar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-[450px]">
            <BarChart
              data={dataWithColors}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <defs>
                {dataWithColors.map((entry, index) => (
                  <linearGradient
                    key={`grad-parl-${index}`}
                    id={`colorParl-${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="5%"
                      stopColor={entry.baseColor}
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="95%"
                      stopColor={entry.baseColor}
                      stopOpacity={0.4}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                opacity={0.5}
              />
              <XAxis
                type="number"
                tickFormatter={(v) =>
                  isPrivacyMode
                    ? '••••••'
                    : new Intl.NumberFormat('pt-BR', {
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
                width={160}
                axisLine={false}
                tickLine={false}
                fontSize={12}
                tickFormatter={(val) => {
                  const parts = val.split(' ')
                  return parts.length > 2
                    ? `${parts[0]} ${parts[parts.length - 1]}`
                    : val
                }}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      formatCurrencyBRL(Number(value), isPrivacyMode)
                    }
                    className="tabular-nums"
                  />
                }
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={20}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {dataWithColors.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorParl-${index})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className={PREMIUM_CARD_CLASS}>
        <CardHeader>
          <CardTitle>Execução Detalhada por Parlamentar</CardTitle>
          <CardDescription>
            Recursos efetivamente executados agrupados por parlamentar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-[500px]">
            <BarChart
              data={execDataWithColors}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <defs>
                {execDataWithColors.map((entry, index) => (
                  <linearGradient
                    key={`grad-exec-${index}`}
                    id={`colorExecPar-${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="5%"
                      stopColor={entry.baseColor}
                      stopOpacity={0.85}
                    />
                    <stop
                      offset="95%"
                      stopColor={entry.baseColor}
                      stopOpacity={0.35}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                opacity={0.5}
              />
              <XAxis
                type="number"
                tickFormatter={(v) =>
                  isPrivacyMode
                    ? '••••••'
                    : new Intl.NumberFormat('pt-BR', {
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
                width={160}
                axisLine={false}
                tickLine={false}
                fontSize={12}
                tickFormatter={(val) => {
                  const parts = val.split(' ')
                  return parts.length > 2
                    ? `${parts[0]} ${parts[parts.length - 1]}`
                    : val
                }}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      formatCurrencyBRL(Number(value), isPrivacyMode)
                    }
                    className="tabular-nums"
                  />
                }
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="totalExecuted"
                name="Total Executado"
                radius={[0, 4, 4, 0]}
                barSize={20}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {execDataWithColors.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorExecPar-${index})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
