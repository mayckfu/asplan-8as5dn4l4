import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  FileDown,
  Upload,
  Smile,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'
import { FileUpload } from '@/components/FileUpload'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const kpis = [
  { title: 'Procedimentos (Mês)', value: '2.150', icon: ClipboardList },
  { title: 'Primeiras Consultas', value: '430', icon: Smile },
  { title: 'Urgências Atendidas', value: '125', icon: AlertCircle },
]

const chartData = [
  { name: 'UBS Centro', total: 800 },
  { name: 'UBS B. Novo', total: 650 },
  { name: 'UBS V. Feliz', total: 900 },
  { name: 'UBS M. Sol', total: 450 },
]

const tableData = [
  { ubs: 'UBS Centro', total: 800, proc1: 300, proc2: 250, proc3: 250 },
  { ubs: 'UBS Bairro Novo', total: 650, proc1: 250, proc2: 200, proc3: 200 },
  { ubs: 'UBS Vila Feliz', total: 900, proc1: 400, proc2: 300, proc3: 200 },
  { ubs: 'UBS Morada do Sol', total: 450, proc1: 200, proc2: 150, proc3: 100 },
]

const SaudeBucalPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">
          Saúde Bucal
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar Planilha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar Dados de Saúde Bucal</DialogTitle>
            </DialogHeader>
            <FileUpload onFilesAccepted={(files) => console.log(files)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
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
            Produção por UBS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="w-full h-[300px]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
            Detalhamento de Procedimentos por UBS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>UBS</TableHead>
                <TableHead className="text-right tabular-nums">Total</TableHead>
                <TableHead className="text-right tabular-nums">
                  Restauração
                </TableHead>
                <TableHead className="text-right tabular-nums">
                  Extração
                </TableHead>
                <TableHead className="text-right tabular-nums">
                  Limpeza
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.ubs}>
                  <TableCell className="font-medium">{row.ubs}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.total}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.proc1}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.proc2}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.proc3}
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

export default SaudeBucalPage
