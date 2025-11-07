import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

const indicators = [
  {
    name: 'Pré-Natal (6+ consultas)',
    goal: '95%',
    value: '92%',
    status: 'abaixo',
    trend: 'up',
    unit: '%',
  },
  {
    name: 'Cobertura Citopatológico',
    goal: '85%',
    value: '88%',
    status: 'batido',
    trend: 'up',
    unit: '%',
  },
  {
    name: 'Cobertura Vacinal (Pólio)',
    goal: '95%',
    value: '96%',
    status: 'batido',
    trend: 'stable',
    unit: '%',
  },
  {
    name: 'Hipertensos Acompanhados',
    goal: '70%',
    value: '65%',
    status: 'abaixo',
    trend: 'down',
    unit: '%',
  },
  {
    name: 'Diabéticos Acompanhados',
    goal: '70%',
    value: '71%',
    status: 'batido',
    trend: 'up',
    unit: '%',
  },
  {
    name: 'Registro Inconsistente',
    goal: '0',
    value: '12',
    status: 'pendente',
    trend: 'stable',
    unit: 'abs',
  },
]

const chartData = [
  { month: 'Jan', value: 88 },
  { month: 'Fev', value: 89 },
  { month: 'Mar', value: 90 },
  { month: 'Abr', value: 91 },
  { month: 'Mai', value: 91.5 },
  { month: 'Jun', value: 92 },
]

const IndicatorCard = ({ indicator, onClick }: any) => {
  const statusStyles: any = {
    batido: 'bg-success text-primary-foreground',
    abaixo: 'bg-warning text-primary-foreground',
    pendente: 'bg-destructive text-destructive-foreground',
  }
  const TrendIcon =
    indicator.trend === 'up'
      ? ArrowUp
      : indicator.trend === 'down'
        ? ArrowDown
        : ArrowRight
  return (
    <Card
      className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-primary transition"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-200">
          {indicator.name}
        </CardTitle>
        <CardDescription>Meta: {indicator.goal}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-end">
        <div>
          <p className="text-3xl font-bold tabular-nums">{indicator.value}</p>
          <Badge className={statusStyles[indicator.status]}>
            {indicator.status}
          </Badge>
        </div>
        <TrendIcon
          className={`h-6 w-6 ${
            indicator.trend === 'up'
              ? 'text-success'
              : indicator.trend === 'down'
                ? 'text-destructive'
                : 'text-muted-foreground'
          }`}
        />
      </CardContent>
    </Card>
  )
}

const IndicadoresPage = () => {
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">
        Indicadores de Saúde
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((indicator) => (
          <IndicatorCard
            key={indicator.name}
            indicator={indicator}
            onClick={() => setSelectedIndicator(indicator)}
          />
        ))}
      </div>
      <Dialog
        open={!!selectedIndicator}
        onOpenChange={(isOpen) => !isOpen && setSelectedIndicator(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Indicador: {selectedIndicator?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-semibold mb-2">Evolução (Últimos 6 meses)</h3>
            <ChartContainer config={{}} className="w-full h-[250px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tickFormatter={(v) => `${v}${selectedIndicator?.unit}`}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) => `${v}${selectedIndicator?.unit}`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                />
              </LineChart>
            </ChartContainer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default IndicadoresPage
