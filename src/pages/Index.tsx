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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { formatCurrencyBRL } from '@/lib/utils'

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
        value: `${execucaoMedia.toFixed(1)}%`,
        icon: Percent,
      },
      {
        title: 'Cobertura Média',
        value: `${coberturaMedia.toFixed(1)}%`,
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

    const gastoPorUnidade = allDespesas.reduce(
      (acc, { unidade_destino, valor }) => {
        acc[unidade_destino] = (acc[unidade_destino] || 0) + valor
        return acc
      },
      {} as Record<string, number>,
    )
    const gastoPorUnidadeData = Object.entries(gastoPorUnidade).map(
      ([name, value]) => ({ name, value }),
    )

    const gastoPorDemanda = allDespesas.reduce(
      (acc, { demanda, valor }) => {
        const key = demanda || 'Sem Demanda'
        acc[key] = (acc[key] || 0) + valor
        return acc
      },
      {} as Record<string, number>,
    )
    const gastoPorDemandaData = Object.entries(gastoPorDemanda).map(
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
      gastoPorUnidadeData,
      gastoPorDemandaData,
      lineChartData,
    }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-800">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {dashboardData.kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="rounded-2xl shadow-sm border border-neutral-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs text-neutral-500">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-5 w-5 text-neutral-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums leading-tight text-neutral-800">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {dashboardData.alerts
          .filter((alert) => alert.count > 0)
          .map((alert) => (
            <Link to={alert.link} key={alert.title}>
              <Card className="rounded-2xl shadow-sm border border-neutral-200 hover:bg-destructive/10 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-destructive">
                    {alert.title}
                  </CardTitle>
                  <alert.icon className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive tabular-nums">
                    {alert.count}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-sm border border-neutral-200">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-800">
              Repasses e Despesas por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="despesas"
                  stroke="hsl(var(--danger))"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-neutral-200">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-800">
              Gasto por Responsável
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-neutral-200">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-800">
              Gasto por Unidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart data={dashboardData.gastoPorUnidadeData}>
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
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-neutral-200">
          <CardHeader>
            <CardTitle className="font-medium text-neutral-800">
              Gasto por Demanda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="w-full h-[300px]">
              <BarChart data={dashboardData.gastoPorDemandaData}>
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
                <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Index
