import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { kpiData } from '@/lib/mock-data'
import { DollarSign, List, Search, CheckCircle } from 'lucide-react'

const iconMap = {
  list: List,
  search: Search,
  'dollar-sign': DollarSign,
  'check-circle': CheckCircle,
}

const chartData = [
  { status: 'Aprovado', total: 40, fill: 'hsl(var(--success))' },
  { status: 'Em Análise', total: 25, fill: 'hsl(var(--info))' },
  { status: 'Pendente', total: 20, fill: 'hsl(var(--warning))' },
  { status: 'Rejeitado', total: 15, fill: 'hsl(var(--danger))' },
]

const barChartData = [
  { month: 'Jan', value: 250000 },
  { month: 'Fev', value: 450000 },
  { month: 'Mar', value: 300000 },
  { month: 'Abr', value: 600000 },
  { month: 'Mai', value: 350000 },
]

const Index = () => {
  return (
    <div className="container mx-auto py-2 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpiData.map((kpi) => {
          const Icon = iconMap[kpi.icon as keyof typeof iconMap]
          return (
            <Card
              key={kpi.title}
              className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Emendas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="status"
                  innerRadius={60}
                >
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valores Repassados (Últimos 5 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => `R$${Number(value) / 1000}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        `R$ ${Number(value).toLocaleString('pt-BR')}`
                      }
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Index
