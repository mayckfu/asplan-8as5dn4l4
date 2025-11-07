import { useState } from 'react'
import {
  PlusCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Despesa } from '@/lib/mock-data'
import { StatusBadge } from '@/components/StatusBadge'
import { ExpenseDossierDrawer } from './ExpenseDossierDrawer'
import { formatCurrencyBRL } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EmendaDespesasTabProps {
  despesas: Despesa[]
  onDespesasChange: (despesas: Despesa[]) => void
}

export const EmendaDespesasTab = ({
  despesas,
  onDespesasChange,
}: EmendaDespesasTabProps) => {
  const { toast } = useToast()
  const [dossierExpense, setDossierExpense] = useState<Despesa | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Despesa | null>(null)

  const handleAddNew = () => {
    setSelectedExpense(null)
    setIsFormOpen(true)
  }

  const handleEdit = (despesa: Despesa) => {
    setSelectedExpense(despesa)
    setIsFormOpen(true)
  }

  const handleDelete = (despesa: Despesa) => {
    setSelectedExpense(despesa)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedExpense) {
      onDespesasChange(despesas.filter((d) => d.id !== selectedExpense.id))
      toast({ title: 'Despesa excluída com sucesso!' })
    }
    setIsDeleteOpen(false)
    setSelectedExpense(null)
  }

  return (
    <>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Despesas
            </CardTitle>
            <Button size="sm" onClick={handleAddNew}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Despesa
            </Button>
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
                  <TableCell className="text-right tabular-nums">
                    {formatCurrencyBRL(despesa.valor)}
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
                        <DropdownMenuItem onClick={() => handleEdit(despesa)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(despesa)}
                        >
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
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedExpense ? 'Editar Despesa' : 'Adicionar Despesa'}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para registrar a despesa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data" className="text-right">
                Data
              </Label>
              <Input id="data" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <Input id="descricao" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">
                Valor
              </Label>
              <Input id="valor" type="number" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANEJADA">Planejada</SelectItem>
                  <SelectItem value="EMPENHADA">Empenhada</SelectItem>
                  <SelectItem value="LIQUIDADA">Liquidada</SelectItem>
                  <SelectItem value="PAGA">Paga</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsFormOpen(false)}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a despesa "
              {selectedExpense?.descricao}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
