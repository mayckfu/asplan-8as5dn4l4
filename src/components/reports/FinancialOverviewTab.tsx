import { useMemo } from 'react'
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

interface FinancialOverviewTabProps {
  consolidatedByTipoRecurso: { name: string; value: number }[]
  consolidatedBySituacao: { name: string; value: number }[]
  executionStatus: { name: string; value: number }[]
  COLORS: string[]
}

const chartConfig = {
  value: {
    label: 'Valor',
  },
} satisfies ChartConfig

export function FinancialOverviewTab({
  consolidatedByTipoRecurso,
  consolidatedBySituacao,
  executionStatus,
  COLORS,
}: FinancialOverviewTabProps) {
  const { isPrivacyMode } = usePrivacy()

  const situacaoDataWithColors = useMemo(
    () =>
      consolidatedBySituacao.map((d) => ({
        ...d,
        baseColor: stringToColor(d.name),
      })),
    [consolidatedBySituacao],
  )

  const PREMIUM_CARD_CLASS =
    'rounded-2xl border border-border/40 shadow-lg bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl'

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className={PREMIUM_CARD_CLASS}>
        <CardHeader>
          <CardTitle>Consolidado por Tipo de Recurso</CardTitle>
          <CardDescription>Distribuição do valor total orçado</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="w-full h-[300px] [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <Pie
                data={consolidatedByTipoRecurso}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={3}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {consolidatedByTipoRecurso.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={0}
                    className="hover:opacity-80 transition-opacity outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      formatCurrencyBRL(Number(value), isPrivacyMode)
                    }
                    className="tabular-nums"
                  />
                }
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className={PREMIUM_CARD_CLASS}>
        <CardHeader>
          <CardTitle>Status de Execução Geral</CardTitle>
          <CardDescription>
            Estado atual das despesas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="w-full h-[300px] [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <Pie
                data={executionStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={0}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {executionStatus.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[(index + 3) % COLORS.length]}
                    stroke="var(--background)"
                    strokeWidth={2}
                    className="hover:opacity-90 transition-opacity outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      formatCurrencyBRL(Number(value), isPrivacyMode)
                    }
                    className="tabular-nums"
                  />
                }
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className={`col-span-1 md:col-span-2 ${PREMIUM_CARD_CLASS}`}>
        <CardHeader>
          <CardTitle>Situação Oficial das Emendas</CardTitle>
          <CardDescription>
            Montantes totais agrupados pelo status oficial no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-[350px]">
            <BarChart data={situacaoDataWithColors} margin={{ top: 20 }}>
              <defs>
                {situacaoDataWithColors.map((entry, index) => (
                  <linearGradient
                    key={`grad-sit-${index}`}
                    id={`colorSituacao-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={entry.baseColor}
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="95%"
                      stopColor={entry.baseColor}
                      stopOpacity={0.3}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.5}
              />
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
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {situacaoDataWithColors.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorSituacao-${index})`}
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
