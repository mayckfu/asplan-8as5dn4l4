import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { formatCurrencyBRL } from '@/lib/utils'

interface ExecutionDetailsTabProps {
  executionByResponsavel: { name: string; value: number }[]
  executionByUnidade: { name: string; value: number }[]
}

export function ExecutionDetailsTab({
  executionByResponsavel,
  executionByUnidade,
}: ExecutionDetailsTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="rounded-xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Execução por Responsável</CardTitle>
          <CardDescription>Quem está registrando mais despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="w-full h-[400px]">
            <BarChart
              data={executionByResponsavel}
              layout="vertical"
              margin={{ left: 10 }}
            >
              <defs>
                <linearGradient
                  id="colorResponsavel"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--warning))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--warning))"
                    stopOpacity={0.4}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v) =>
                  new Intl.NumberFormat('pt-BR', {
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
                width={100}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={formatCurrencyBRL}
                    className="tabular-nums"
                  />
                }
                cursor={{ fill: 'transparent' }}
              />
              <Bar
                dataKey="value"
                fill="url(#colorResponsavel)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Execução por Unidade</CardTitle>
          <CardDescription>Destino dos recursos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="w-full h-[400px]">
            <BarChart
              data={executionByUnidade}
              layout="vertical"
              margin={{ left: 10 }}
            >
              <defs>
                <linearGradient id="colorUnidade" x1="0" y1="0" x2="1" y2="0">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--asplan-blue-neutral))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--asplan-blue-neutral))"
                    stopOpacity={0.4}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v) =>
                  new Intl.NumberFormat('pt-BR', {
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
                width={100}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={formatCurrencyBRL}
                    className="tabular-nums"
                  />
                }
                cursor={{ fill: 'transparent' }}
              />
              <Bar
                dataKey="value"
                fill="url(#colorUnidade)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
