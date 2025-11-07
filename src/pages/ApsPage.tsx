import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { FileDown, Users, Stethoscope, Syringe, Home } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const kpis = [
  {
    title: 'Cadastros Ativos',
    value: '45.890',
    icon: Users,
  },
  {
    title: 'Visitas ACS (Mês)',
    value: '12.345',
    icon: Home,
  },
  {
    title: 'Consultas Méd/Enf (Mês)',
    value: '8.765',
    icon: Stethoscope,
  },
  {
    title: 'Doses de Vacinas (Mês)',
    value: '4.567',
    icon: Syringe,
  },
]

const chartData = [
  { month: 'Jan', visits: 4000, consults: 2400, vaccines: 1800 },
  { month: 'Fev', visits: 3000, consults: 1398, vaccines: 2210 },
  { month: 'Mar', visits: 2000, consults: 9800, vaccines: 2290 },
  { month: 'Abr', visits: 2780, consults: 3908, vaccines: 2000 },
  { month: 'Mai', visits: 1890, consults: 4800, vaccines: 2181 },
  { month: 'Jun', visits: 2390, consults: 3800, vaccines: 2500 },
]

const tableData = [
  {
    ubs: 'UBS Centro',
    visits: 1200,
    medical: 450,
    nursing: 300,
    vaccines: 250,
    status: 'OK',
  },
  {
    ubs: 'UBS Bairro Novo',
    visits: 980,
    medical: 380,
    nursing: 250,
    vaccines: 200,
    status: 'PENDENTE',
  },
  {
    ubs: 'UBS Vila Feliz',
    visits: 1500,
    medical: 600,
    nursing: 400,
    vaccines: 350,
    status: 'OK',
  },
  {
    ubs: 'UBS Morada do Sol',
    visits: 750,
    medical: 290,
    nursing: 190,
    vaccines: 150,
    status: 'INCONSISTENTE',
  },
]

const ApsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">
        Painel APS
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-5 w-5 text-neutral-500 dark:text-neutral-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
            Evolução Mensal (Últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="w-full h-[300px]">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="visits"
                name="Visitas ACS"
                stroke="hsl(var(--chart-1))"
              />
              <Line
                type="monotone"
                dataKey="consults"
                name="Consultas"
                stroke="hsl(var(--chart-2))"
              />
              <Line
                type="monotone"
                dataKey="vaccines"
                name="Vacinas"
                stroke="hsl(var(--chart-3))"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Produção por UBS
            </CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Filtrar por UBS..." className="max-w-xs" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1">Equipe 1</SelectItem>
                  <SelectItem value="team2">Equipe 2</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Filtrar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>UBS</TableHead>
                <TableHead className="text-right tabular-nums">
                  Visitas ACS
                </TableHead>
                <TableHead className="text-right tabular-nums">
                  Consultas Médicas
                </TableHead>
                <TableHead className="text-right tabular-nums">
                  Consultas Enfermagem
                </TableHead>
                <TableHead className="text-right tabular-nums">
                  Vacinas
                </TableHead>
                <TableHead>Status do Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.ubs}>
                  <TableCell className="font-medium">{row.ubs}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.visits}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.medical}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.nursing}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.vaccines}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === 'OK'
                          ? 'default'
                          : row.status === 'PENDENTE'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className={
                        row.status === 'OK'
                          ? 'bg-success hover:bg-success/80'
                          : ''
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ApsPage
