import { useState, forwardRef, useImperativeHandle } from 'react'
import {
  PlusCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
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
  DialogDescription,
  DialogFooter,
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
import { formatCurrencyBRL } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import {
  formatDisplayDate,
  formatDateToDB,
  parseDateFromDB,
} from '@/lib/date-utils'

interface EmendaRepassesTabProps {
  repasses: Repasse[]
  onRepassesChange: (repasses: Repasse[]) => void
}

export interface EmendaRepassesTabHandles {
  triggerAdd: () => void
}

export const EmendaRepassesTab = forwardRef<
  EmendaRepassesTabHandles,
  EmendaRepassesTabProps
>(({ repasses, onRepassesChange }, ref) => {
  const { toast } = useToast()
  const { user, checkPermission } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRepasse, setSelectedRepasse] = useState<Repasse | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<Repasse>>({})

  // Security
  const canEdit = checkPermission(['ADMIN', 'GESTOR'])

  useImperativeHandle(ref, () => ({
    triggerAdd: () => {
      if (!canEdit) return
      setSelectedRepasse(null)
      setFormData({
        data: formatDateToDB(new Date()),
        status: 'PENDENTE',
        valor: 0,
        fonte: '',
      })
      setIsFormOpen(true)
    },
  }))

  const handleAddNew = () => {
    setSelectedRepasse(null)
    setFormData({
      data: formatDateToDB(new Date()),
      status: 'PENDENTE',
      valor: 0,
      fonte: '',
    })
    setIsFormOpen(true)
  }

  const handleEdit = (repasse: Repasse) => {
    setSelectedRepasse(repasse)
    setFormData({
      ...repasse,
      data: repasse.data,
    })
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

  const handleSave = () => {
    if (!formData.data || !formData.valor || !formData.fonte) {
      toast({
        title: 'Erro',
        description: 'Preencha os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    const newRepasse: Repasse = {
      id: selectedRepasse?.id || `R-${Date.now()}`,
      data: formData.data!,
      valor: Number(formData.valor),
      fonte: formData.fonte!,
      status: formData.status || 'PENDENTE',
      observacoes: formData.observacoes,
    }

    if (selectedRepasse) {
      onRepassesChange(
        repasses.map((r) => (r.id === selectedRepasse.id ? newRepasse : r)),
      )
      toast({ title: 'Repasse atualizado com sucesso!' })
    } else {
      onRepassesChange([...repasses, newRepasse])
      toast({ title: 'Repasse adicionado com sucesso!' })
    }
    setIsFormOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REPASSADO':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  return (
    <>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Repasses
            </CardTitle>
            {canEdit && (
              <Button size="sm" onClick={handleAddNew}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Repasse
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {repasses.length === 0 ? (
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
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repasses.map((repasse) => (
                  <TableRow key={repasse.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-neutral-500" />
                        {formatDisplayDate(repasse.data)}
                      </div>
                    </TableCell>
                    <TableCell>{repasse.fonte}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(repasse.status)}
                      >
                        {repasse.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {formatCurrencyBRL(repasse.valor)}
                    </TableCell>
                    <TableCell className="text-right">
                      {canEdit && (
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
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRepasse ? 'Editar Repasse' : 'Novo Repasse'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do repasse financeiro.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data" className="text-right">
                Data
              </Label>
              <Input
                id="data"
                type="date"
                className="col-span-3"
                value={formData.data || ''}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">
                Valor
              </Label>
              <div className="col-span-3">
                <MoneyInput
                  value={formData.valor || 0}
                  onChange={(value) =>
                    setFormData({ ...formData, valor: value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fonte" className="text-right">
                Fonte
              </Label>
              <Input
                id="fonte"
                className="col-span-3"
                value={formData.fonte || ''}
                onChange={(e) =>
                  setFormData({ ...formData, fonte: e.target.value })
                }
                placeholder="Ex: Tesouro Estadual"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="REPASSADO">Repassado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observacoes" className="text-right">
                Obs.
              </Label>
              <Input
                id="observacoes"
                className="col-span-3"
                value={formData.observacoes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este repasse? Esta ação não pode
              ser desfeita e afetará o saldo total repassado.
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
