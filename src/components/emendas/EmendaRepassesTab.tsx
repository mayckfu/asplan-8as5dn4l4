import { useState, forwardRef, useImperativeHandle } from 'react'
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
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
import { Repasse } from '@/lib/mock-data'
import { formatCurrencyBRL, cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { RepasseForm } from './RepasseForm'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

interface EmendaRepassesTabProps {
  repasses: Repasse[]
  onRepassesChange: (repasses: Repasse[]) => void
}

export interface EmendaRepassesTabHandles {
  triggerAdd: () => void
}

const statusVariant: Record<Repasse['status'], string> = {
  REPASSADO: 'bg-success text-primary-foreground',
  PENDENTE: 'bg-warning text-primary-foreground',
  CANCELADO: 'bg-destructive text-destructive-foreground',
}

export const EmendaRepassesTab = forwardRef<
  EmendaRepassesTabHandles,
  EmendaRepassesTabProps
>(({ repasses, onRepassesChange }, ref) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRepasse, setSelectedRepasse] = useState<Repasse | null>(null)

  const isReadOnly = user?.role === 'CONSULTA'

  useImperativeHandle(ref, () => ({
    triggerAdd: () => {
      if (isReadOnly) return
      setSelectedRepasse(null)
      setIsFormOpen(true)
    },
  }))

  const sortedRepasses = [...repasses].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  )

  const handleAddNew = () => {
    setSelectedRepasse(null)
    setIsFormOpen(true)
  }

  const handleEdit = (repasse: Repasse) => {
    setSelectedRepasse(repasse)
    setIsFormOpen(true)
  }

  const handleDelete = (repasse: Repasse) => {
    setSelectedRepasse(repasse)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedRepasse) {
      onRepassesChange(repasses.filter((r) => r.id !== selectedRepasse.id))
      toast({ title: 'Repasse excluído com sucesso!' })
    }
    setIsDeleteOpen(false)
    setSelectedRepasse(null)
  }

  const handleFormSubmit = (repasse: Repasse) => {
    if (selectedRepasse) {
      onRepassesChange(repasses.map((r) => (r.id === repasse.id ? repasse : r)))
      toast({ title: 'Repasse atualizado com sucesso!' })
    } else {
      onRepassesChange([...repasses, repasse])
      toast({ title: 'Repasse adicionado com sucesso!' })
    }
    setIsFormOpen(false)
    setSelectedRepasse(null)
  }

  return (
    <>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Repasses Financeiros
            </CardTitle>
            {!isReadOnly && (
              <Button size="sm" onClick={handleAddNew}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Repasse
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sortedRepasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum repasse registrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  {!isReadOnly && (
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRepasses.map((repasse) => (
                  <TableRow key={repasse.id}>
                    <TableCell>
                      {new Date(repasse.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{repasse.fonte}</TableCell>
                    <TableCell>
                      <Badge className={cn(statusVariant[repasse.status])}>
                        {repasse.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrencyBRL(repasse.valor)}
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleEdit(repasse)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(repasse)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRepasse ? 'Editar Repasse' : 'Adicionar Repasse'}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do repasse financeiro.
            </DialogDescription>
          </DialogHeader>
          <RepasseForm
            repasse={selectedRepasse}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este repasse? Esta ação não pode
              ser desfeita.
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
})
