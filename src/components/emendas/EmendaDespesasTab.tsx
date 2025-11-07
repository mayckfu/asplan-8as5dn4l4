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

interface EmendaDespesasTabProps {
  despesas: Despesa[]
}

export const EmendaDespesasTab = ({ despesas }: EmendaDespesasTabProps) => {
  const [dossierExpense, setDossierExpense] = useState<Despesa | null>(null)
  const [statusExpense, setStatusExpense] = useState<Despesa | null>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>Despesas</CardTitle>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesas.map((despesa) => (
                <TableRow key={despesa.id}>
                  <TableCell>
                    {new Date(despesa.data).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {despesa.descricao}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={despesa.status_execucao as any} />
                  </TableCell>
                  <TableCell className="text-right">
                    {despesa.valor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
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
                          <CheckSquare className="mr-2 h-4 w-4" /> Mudar Status
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
