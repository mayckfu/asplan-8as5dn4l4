import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker' // Assuming this component exists

const reportChartData = [
  { category: 'Obras', value: 1200000 },
  { category: 'Custeio Saúde', value: 850000 },
  { category: 'Educação', value: 700000 },
  { category: 'Equipamentos', value: 450000 },
  { category: 'Outros', value: 300000 },
]

const RelatoriosPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatório</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Emendas por Status</SelectItem>
              <SelectItem value="category">Despesas por Categoria</SelectItem>
              <SelectItem value="period">Repasses por Período</SelectItem>
            </SelectContent>
          </Select>
          {/* A proper DateRangePicker would be used here. For now, a placeholder. */}
          <div className="p-2 border rounded-md text-sm text-muted-foreground">
            Selecione um período
          </div>
          <Button>Gerar Relatório</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatório de Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="w-full h-[400px]">
            <BarChart
              data={reportChartData}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(value) => `R$${Number(value) / 1000}k`}
              />
              <YAxis type="category" dataKey="category" width={100} />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
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
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default RelatoriosPage
