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
import { FileDown, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FileUpload } from '@/components/FileUpload'

const tableData = [
  {
    type: 'Consulta Médica',
    ubs: 'UBS Centro',
    team: 'Equipe A',
    date: '2023-06-15',
    quantity: 25,
  },
  {
    type: 'Visita ACS',
    ubs: 'UBS Bairro Novo',
    team: 'Equipe C',
    date: '2023-06-15',
    quantity: 80,
  },
  {
    type: 'Vacina Dose',
    ubs: 'UBS Centro',
    team: 'Equipe B',
    date: '2023-06-15',
    quantity: 40,
  },
]

const ProducaoEsusPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">
          Produção e-SUS
        </h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV/Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Produção e-SUS</DialogTitle>
              </DialogHeader>
              <FileUpload onFilesAccepted={(files) => console.log(files)} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
            Registros de Produção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 bg-background/90 backdrop-blur-sm z-10">
                <TableHead>Tipo</TableHead>
                <TableHead>UBS</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right tabular-nums">
                  Quantidade
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, i) => (
                <TableRow
                  key={i}
                  className="h-10 py-2 odd:bg-white even:bg-neutral-50 hover:bg-neutral-100 dark:odd:bg-card dark:even:bg-muted/50 dark:hover:bg-muted"
                >
                  <TableCell className="font-medium">{row.type}</TableCell>
                  <TableCell>{row.ubs}</TableCell>
                  <TableCell>{row.team}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.quantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Mostrando 1-3 de 1.256 registros
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ProducaoEsusPage
