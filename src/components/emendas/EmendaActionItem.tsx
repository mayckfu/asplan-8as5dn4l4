import { useState } from 'react'
import {
  ActionWithDestinations,
  Destination,
  DetailedAmendment,
  AuditCategories,
} from '@/lib/mock-data'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoneyInput } from '@/components/ui/money-input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { formatCurrencyBRL } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { EmendaActionForm } from './EmendaActionForm'

interface EmendaActionItemProps {
  action: ActionWithDestinations
  emenda: DetailedAmendment
  onUpdate: () => void
}

export const EmendaActionItem = ({
  action,
  emenda,
  onUpdate,
}: EmendaActionItemProps) => {
  const { toast } = useToast()
  const { checkPermission } = useAuth()
  const [isEditActionOpen, setIsEditActionOpen] = useState(false)
  const [isDestOpen, setIsDestOpen] = useState(false)
  const [editingDest, setEditingDest] = useState<Destination | null>(null)
  const [destForm, setDestForm] = useState<Partial<Destination>>({})

  const canEdit = checkPermission(['ADMIN', 'GESTOR', 'ANALISTA'])

  const handleDeleteAction = async () => {
    if (!confirm('Excluir esta ação e todas as suas destinações?')) return
    try {
      const { error } = await supabase
        .from('acoes_emendas')
        .delete()
        .eq('id', action.id)
      if (error) throw error
      onUpdate()
      toast({ title: 'Ação excluída' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message,
        variant: 'destructive',
      })
    }
  }

  const handleOpenDest = (dest?: Destination) => {
    if (dest) {
      setEditingDest(dest)
      setDestForm(dest)
    } else {
      setEditingDest(null)
      setDestForm({
        valor_destinado: 0,
        grupo_despesa: AuditCategories.SERVICOS_TERCEIROS,
      })
    }
    setIsDestOpen(true)
  }

  const handleSaveDest = async () => {
    try {
      if (!destForm.tipo_destinacao || !destForm.valor_destinado) {
        toast({
          title: 'Erro',
          description: 'Preencha tipo e valor',
          variant: 'destructive',
        })
        return
      }

      // Validation: Sum check
      const currentSum = emenda.acoes.reduce(
        (acc, a) =>
          acc +
          a.destinacoes.reduce(
            (dAcc, d) =>
              d.id === editingDest?.id ? dAcc : dAcc + d.valor_destinado,
            0,
          ),
        0,
      )
      // Add new value
      const newTotal = currentSum + Number(destForm.valor_destinado)

      if (newTotal > emenda.valor_total) {
        toast({
          title: 'Erro de Validação',
          description: `O valor total destinado (${formatCurrencyBRL(newTotal)}) excede o valor da emenda (${formatCurrencyBRL(emenda.valor_total)})`,
          variant: 'destructive',
        })
        return
      }

      const payload = {
        acao_id: action.id,
        tipo_destinacao: destForm.tipo_destinacao,
        subtipo: destForm.subtipo || null,
        valor_destinado: destForm.valor_destinado,
        portaria_vinculada: destForm.portaria_vinculada || null,
        observacao_tecnica: destForm.observacao_tecnica || null,
        grupo_despesa: destForm.grupo_despesa || AuditCategories.OUTROS,
      }

      if (editingDest) {
        const { error } = await supabase
          .from('destinacoes_recursos')
          .update(payload)
          .eq('id', editingDest.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('destinacoes_recursos')
          .insert(payload)
        if (error) throw error
      }
      setIsDestOpen(false)
      onUpdate()
      toast({ title: 'Destinação salva' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteDest = async (id: string) => {
    if (!confirm('Excluir destinação?')) return
    try {
      const { error } = await supabase
        .from('destinacoes_recursos')
        .delete()
        .eq('id', id)
      if (error) throw error
      onUpdate()
      toast({ title: 'Destinação excluída' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Card className="border border-neutral-200 dark:border-neutral-800">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base font-semibold">
                {action.nome_acao}
              </CardTitle>
              <CardDescription className="text-xs">
                {action.area} •{' '}
                {action.complexidade || 'Complexidade não definida'}
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => setIsEditActionOpen(true)}
                  title="Editar Ação"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDeleteAction}
                  title="Excluir Ação"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border bg-muted/20">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-2 h-9 text-xs">Tipo</TableHead>
                    <TableHead className="py-2 h-9 text-xs">Grupo</TableHead>
                    <TableHead className="py-2 h-9 text-xs">Subtipo</TableHead>
                    <TableHead className="py-2 h-9 text-xs text-right">
                      Valor
                    </TableHead>
                    <TableHead className="py-2 h-9 text-xs w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {action.destinacoes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-4 text-muted-foreground text-xs"
                      >
                        Nenhuma destinação registrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    action.destinacoes.map((dest) => (
                      <TableRow key={dest.id}>
                        <TableCell className="py-2 text-xs font-medium">
                          {dest.tipo_destinacao}
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {dest.grupo_despesa || '-'}
                        </TableCell>
                        <TableCell className="py-2 text-xs">
                          {dest.subtipo || '-'}
                        </TableCell>
                        <TableCell className="py-2 text-xs text-right font-medium">
                          {formatCurrencyBRL(dest.valor_destinado)}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          {canEdit && (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleOpenDest(dest)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => handleDeleteDest(dest.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed"
                onClick={() => handleOpenDest()}
              >
                <Plus className="h-3 w-3 mr-2" /> Adicionar Destinação Extra
              </Button>
            )}
          </div>
        </CardContent>

        <Dialog open={isDestOpen} onOpenChange={setIsDestOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDest ? 'Editar Destinação' : 'Nova Destinação'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados e valores da destinação do recurso.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tipo-destinacao">Tipo de Destinação</Label>
                <Input
                  id="tipo-destinacao"
                  value={destForm.tipo_destinacao || ''}
                  onChange={(e) =>
                    setDestForm({
                      ...destForm,
                      tipo_destinacao: e.target.value,
                    })
                  }
                  placeholder="Ex: PJ, Material de Consumo"
                />
              </div>
              <div className="grid gap-2">
                <Label>Grupo de Despesa (Auditoria)</Label>
                <Select
                  value={destForm.grupo_despesa}
                  onValueChange={(val) =>
                    setDestForm({ ...destForm, grupo_despesa: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AuditCategories).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subtipo">Subtipo (Opcional)</Label>
                <Input
                  id="subtipo"
                  value={destForm.subtipo || ''}
                  onChange={(e) =>
                    setDestForm({ ...destForm, subtipo: e.target.value })
                  }
                  placeholder="Ex: Cirurgias, Medicamentos"
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor Destinado</Label>
                <MoneyInput
                  value={destForm.valor_destinado || 0}
                  onChange={(val) =>
                    setDestForm({ ...destForm, valor_destinado: val })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="portaria-vinculada">Portaria Vinculada</Label>
                <Input
                  id="portaria-vinculada"
                  value={destForm.portaria_vinculada || ''}
                  onChange={(e) =>
                    setDestForm({
                      ...destForm,
                      portaria_vinculada: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="obs-tecnica">Observação Técnica</Label>
                <Textarea
                  id="obs-tecnica"
                  value={destForm.observacao_tecnica || ''}
                  onChange={(e) =>
                    setDestForm({
                      ...destForm,
                      observacao_tecnica: e.target.value,
                    })
                  }
                  placeholder="Detalhes técnicos, justificativas ou especificações..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDestOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveDest}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>

      <EmendaActionForm
        isOpen={isEditActionOpen}
        onOpenChange={setIsEditActionOpen}
        emenda={emenda}
        action={action}
        onSuccess={onUpdate}
      />
    </>
  )
}
