import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
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

interface ExecutionDetailsTabProps {
  executionByResponsavel: { name: string; value: number }[]
  executionByUnidade: { name: string; value: number }[]
}

const chartConfig = {
  value: {
    label: 'Valor Executado',
  },
} satisfies ChartConfig

export function ExecutionDetailsTab({
  executionByResponsavel,
  executionByUnidade,
}: ExecutionDetailsTabProps) {
  const { isPrivacyMode } = usePrivacy()

  const respDataWithColors = useMemo(
    () =>
      executionByResponsavel.slice(0, 10).map((d) => ({
        ...d,
        baseColor: stringToColor(d.name),
      })),
    [executionByResponsavel],
  )

  const uniDataWithColors = useMemo(
    () =>
      executionByUnidade.slice(0, 10).map((d) => ({
        ...d,
        baseColor: stringToColor(d.name),
      })),
    [executionByUnidade],
  )

  const PREMIUM_CARD_CLASS =
    'rounded-2xl border border-border/40 shadow-lg bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl'

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className={PREMIUM_CARD_CLASS}>
        <CardHeader>
          <CardTitle>Execução por Responsável</CardTitle>
          <CardDescription>Quem está registrando mais despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-[400px]">
            <BarChart
              data={respDataWithColors}
              layout="vertical"
              margin={{ left: 10, right: 10 }}
            >
              <defs>
                {respDataWithColors.map((entry, index) => (
                  <linearGradient
                    key={`grad-resp-${index}`}
                    id={`colorResp-${index}`}
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
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
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
                width={110}
                axisLine={false}
                tickLine={false}
                fontSize={12}
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
                {respDataWithColors.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorResp-${index})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className={PREMIUM_CARD_CLASS}>
        <CardHeader>
          <CardTitle>Execução por Unidade</CardTitle>
          <CardDescription>Destino operacional dos recursos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full h-[400px]">
            <BarChart
              data={uniDataWithColors}
              layout="vertical"
              margin={{ left: 10, right: 10 }}
            >
              <defs>
                {uniDataWithColors.map((entry, index) => (
                  <linearGradient
                    key={`grad-uni-${index}`}
                    id={`colorUni-${index}`}
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
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
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
                width={110}
                axisLine={false}
                tickLine={false}
                fontSize={12}
                tickFormatter={(val) =>
                  val.length > 15 ? `${val.substring(0, 15)}...` : val
                }
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
                {uniDataWithColors.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorUni-${index})`}
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
