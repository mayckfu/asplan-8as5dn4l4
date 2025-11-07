import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts'
import { format } from 'date-fns'
import {
  AlertTriangle,
  Archive,
  Banknote,
  FileText,
  Landmark,
  Package,
  Percent,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from '@/components/ui/chart'
import {
  amendments,
  getAmendmentDetails,
  DetailedAmendment,
} from '@/lib/mock-data'
import { formatCurrencyBRL, formatPercent, cn } from '@/lib/utils'

const alertConfig: Record<
  string,
  { bgColor: string; iconColor: string; textColor: string }
> = {
  'Falta Portaria': {
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-800 dark:text-amber-300',
  },
  'Falta Deliberação CIE': {
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800 dark:text-blue-300',
  },
  'Sem Anexos Essenciais': {
    bgColor: 'bg-red-100 dark:bg-red-900/50',
    iconColor: 'text-red-500',
    textColor: 'text-red-800 dark:text-red-300',
  },
  'Despesas sem autorização': {
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-800 dark:text-amber-300',
  },
  default: {
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    iconColor: 'text-yellow-500',
    textColor: 'text-yellow-800 dark:text-yellow-300',
  },
}

const Index = () => {
  const dashboardData = useMemo(() => {
    const allDetailedAmendments = amendments
      .map((a) => getAmendmentDetails(a.id))
      .filter((d): d is DetailedAmendment => !!d)

    const allDespesas = allDetailedAmendments.flatMap((a) => a.despesas)
    const allRepasses = allDetailedAmendments.flatMap((a) => a.repasses)

    const totalPropostas = amendments.length
    const totalValor = amendments.reduce((sum, a) => sum + a.valor_total, 0)
    const totalRepassado = amendments.reduce(
      (sum, a) => sum + a.total_repassado,
      0,
    )
    const totalGasto = amendments.reduce((sum, a) => sum + a.total_gasto, 0)
    const execucaoMedia =
      totalRepassado > 0 ? (totalGasto / totalRepassado) * 100 : 0
    const coberturaMedia = totalValor > 0 ? (totalGasto / totalValor) * 100 : 0

    const kpis = [
      { title: 'Total Propostas', value: totalPropostas, icon: Package },
      {
        title: 'Total Valor',
        value: formatCurrencyBRL(totalValor),
        icon: Landmark,
      },
      {
        title: 'Total Repassado',
        value: formatCurrencyBRL(totalRepassado),
        icon: Banknote,
      },
      {
        title: 'Total Gasto',
        value: formatCurrencyBRL(totalGasto),
        icon: ShoppingBag,
      },
      {
        title: 'Execução Média',
        value: formatPercent(execucaoMedia),
        icon: Percent,
      },
      {
        title: 'Cobertura Média',
        value: formatPercent(coberturaMedia),
        icon: Percent,
      },
    ]

    const alerts = [
      {
        title: 'Falta Portaria',
        count: amendments.filter((a) => !a.portaria).length,
        link: '/emendas?semPortaria=true',
        icon: FileText,
      },
      {
        title: 'Falta Deliberação CIE',
        count: amendments.filter((a) => !a.deliberacao_cie).length,
        link: '/emendas?semCIE=true',
        icon: FileText,
      },
      {
        title: 'Sem Anexos Essenciais',
        count: amendments.filter((a) => !a.anexos_essenciais).length,
        link: '/emendas?semAnexos=true',
        icon: Archive,
      },
      {
        title: 'Sem Repasses',
        count: amendments.filter((a) => a.total_repassado <= 0).length,
        link: '/emendas?semRepasses=true',
        icon: Banknote,
      },
      {
        title: 'Despesas sem autorização',
        count: allDespesas.filter((d) => !d.autorizada_por).length,
        link: '/emendas?comDespesasNaoAutorizadas=true',
        icon: ShieldAlert,
      },
      {
        title: 'Despesas > Repasses',
        count: amendments.filter((a) => a.total_gasto > a.total_repassado)
          .length,
        link: '/emendas?despesasMaiorRepasses=true',
        icon: AlertTriangle,
      },
    ]

    const gastoPorResponsavel = allDespesas.reduce(
      (acc, { registrada_por, valor }) => {
        acc[registrada_por] = (acc[registrada_por] || 0) + valor
        return acc
      },
      {} as Record<string, number>,
    )
    const gastoPorResponsavelData = Object.entries(gastoPorResponsavel).map(
      ([name, value]) => ({ name, value }),
    )

    const monthlyData = [...allRepasses, ...allDespesas].reduce(
      (acc, item) => {
        const month = format(new Date(item.data), 'yyyy-MM')
        if (!acc[month]) acc[month] = { month, repasses: 0, despesas: 0 }
        if ('fonte' in item) acc[month].repasses += item.valor
        else acc[month].despesas += item.valor
        return acc
      },
      {} as Record<
        string,
        { month: string; repasses: number; despesas: number }
      >,
    )
    const lineChartData = Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month),
    )

    return {
      kpis,
      alerts,
      gastoPorResponsavelData,
      lineChartData,
    }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">
        Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {dashboardData.kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-3 md:p-4 hover:shadow transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-shrink-0">
                <kpi.icon className="h-6 w-6 text-asplan-blue-neutral" />
              </div>
              <div className="text-right min-w-0">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {kpi.title}
                </p>
                <div className="flex justify-end items-center h-full max-w-full overflow-hidden">
                  <p className="text-2xl sm:text-xl font-semibold text-neutral-900 dark:text-neutral-200 text-right tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
                    {kpi.value}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {dashboardData.alerts
          .filter((alert) => alert.count > 0)
          .map((alert) => {
            const config = alertConfig[alert.title] || alertConfig.default
            return (
              <Link to={alert.link} key={alert.title}>
                <Card
                  className={cn(
                    'rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow',
                    config.bgColor,
                  )}
                >
                  <CardContent className="p-3 md:p-4 flex items-center gap-4">
                    <alert.icon className={cn('h-6 w-6', config.iconColor)} />
                    <div className="min-w-0">
                      <p className={cn('font-medium', config.textColor)}>
                        {alert.title}
                      </p>
                      <p
                        className={cn(
                          'text-xl sm:text-2xl font-bold tabular-nums whitespace-nowrap overflow-hidden text-ellipsis',
                          config.textColor,
                        )}
                      >
                        {alert.count}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-sm p-4 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200 mb-3">
            Repasses e Despesas por Mês
          </h3>
          <ChartContainer config={{}} className="w-full h-[300px]">
            <LineChart data={dashboardData.lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(val) => formatCurrencyBRL(val)} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(val) => formatCurrencyBRL(Number(val))}
                    className="tabular-nums"
                  />
                }
              />
              <ChartLegend />
              <Line
                type="monotone"
                dataKey="repasses"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </Card>
        <Card className="rounded-2xl shadow-sm p-4 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200 mb-3">
            Gasto por Responsável
          </h3>
          <ChartContainer config={{}} className="w-full h-[300px]">
            <BarChart data={dashboardData.gastoPorResponsavelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => formatCurrencyBRL(val)} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(val) => formatCurrencyBRL(Number(val))}
                    className="tabular-nums"
                  />
                }
              />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>
    </div>
  )
}

export default Index
