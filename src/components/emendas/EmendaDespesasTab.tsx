import { useState } from 'react'
import {
  PlusCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  CheckSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Despesa } from '@/lib/mock-data'
import { StatusBadge } from '@/components/StatusBadge'
import { ExpenseDossierDrawer } from './ExpenseDossierDrawer'
import { ExpenseStatusModal } from './ExpenseStatusModal'
import { formatCurrencyBRL } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface EmendaDespesasTabProps {
  despesas: Despesa[]
}

export const EmendaDespesasTab = ({ despesas }: EmendaDespesasTabProps) => {
  const [dossierExpense, setDossierExpense] = useState<Despesa | null>(null)
  const [statusExpense, setStatusExpense] = useState<Despesa | null>(null)

  return (
    <>
      <Card className="rounded-2xl shadow-sm border border-neutral-200">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="font-medium text-neutral-800">
              Despesas
            </CardTitle>
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Despesa
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input placeholder="Filtrar por responsável..." />
            <Input placeholder="Filtrar por unidade..." />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PLANEJADA">Planejada</SelectItem>
                <SelectItem value="EMPENHADA">Empenhada</SelectItem>
                <SelectItem value="LIQUIDADA">Liquidada</SelectItem>
                <SelectItem value="PAGA">Paga</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Filtrar por fornecedor..." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 bg-card/90 backdrop-blur-sm z-10">
                  <TableHead className="font-medium text-neutral-800">
                    Data
                  </TableHead>
                  <TableHead className="font-medium text-neutral-800">
                    Descrição
                  </TableHead>
                  <TableHead className="font-medium text-neutral-800">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-medium text-neutral-800">
                    Valor
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.map((despesa) => (
                  <TableRow
                    key={despesa.id}
                    className="h-10 py-2 text-neutral-600 odd:bg-white even:bg-neutral-50 hover:bg-neutral-100 dark:odd:bg-card dark:even:bg-muted/50 dark:hover:bg-muted"
                  >
                    <TableCell>
                      {new Date(despesa.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {despesa.descricao}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={despesa.status_execucao as any} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrencyBRL(despesa.valor)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => setDossierExpense(despesa)}
                              >
                                <FileText className="mr-2 h-4 w-4" /> Dossiê
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setStatusExpense(despesa)}
                              >
                                <CheckSquare className="mr-2 h-4 w-4" /> Mudar
                                Status
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mais ações</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ExpenseDossierDrawer
        expense={dossierExpense}
        isOpen={!!dossierExpense}
        onOpenChange={(open) => !open && setDossierExpense(null)}
      />
      <ExpenseStatusModal
        expense={statusExpense}
        isOpen={!!statusExpense}
        onOpenChange={(open) => !open && setStatusExpense(null)}
      />
    </>
  )
}
