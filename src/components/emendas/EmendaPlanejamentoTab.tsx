import { useState } from 'react'
import { Action, DetailedAmendment } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmendaActionItem } from './EmendaActionItem'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrencyBRL } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface EmendaPlanejamentoTabProps {
  emenda: DetailedAmendment
  onUpdate: () => void
}

export const EmendaPlanejamentoTab = ({
  emenda,
  onUpdate,
}: EmendaPlanejamentoTabProps) => {
  const { toast } = useToast()
  const { checkPermission } = useAuth()
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [actionForm, setActionForm] = useState<Partial<Action>>({})

  const canEdit = checkPermission(['ADMIN', 'GESTOR', 'ANALISTA'])

  const totalDestinado = emenda.acoes.reduce(
    (acc, a) =>
      acc + a.destinacoes.reduce((dAcc, d) => dAcc + d.valor_destinado, 0),
    0,
  )
  const percentDestinado = (totalDestinado / emenda.valor_total) * 100

  const handleSaveAction = async () => {
    try {
      if (!actionForm.nome_acao || !actionForm.area) {
        toast({
          title: 'Erro',
          description: 'Nome e Área são obrigatórios',
          variant: 'destructive',
        })
        return
      }

      const { error } = await supabase.from('acoes_emendas').insert({
        emenda_id: emenda.id,
        nome_acao: actionForm.nome_acao,
        area: actionForm.area,
        complexidade: actionForm.complexidade,
        publico_alvo: actionForm.publico_alvo,
        descricao_oficial: actionForm.descricao_oficial,
      })

      if (error) throw error

      setIsActionOpen(false)
      onUpdate()
      toast({ title: 'Ação criada com sucesso' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 p-4 rounded-xl bg-muted/30 border border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
            Resumo do Planejamento
          </h3>
          <span className="text-sm font-medium tabular-nums">
            {formatCurrencyBRL(totalDestinado)} /{' '}
            {formatCurrencyBRL(emenda.valor_total)}
          </span>
        </div>
        <div className="space-y-1">
          <Progress value={percentDestinado} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {percentDestinado.toFixed(1)}% alocado
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emenda.acoes.map((action) => (
          <EmendaActionItem
            key={action.id}
            action={action}
            emenda={emenda}
            onUpdate={onUpdate}
          />
        ))}
        {canEdit && (
          <Button
            variant="outline"
            className="h-full min-h-[150px] border-dashed flex flex-col gap-2 hover:bg-muted/50"
            onClick={() => {
              setActionForm({})
              setIsActionOpen(true)
            }}
          >
            <Plus className="h-6 w-6" />
            <span>Adicionar Nova Ação</span>
          </Button>
        )}
      </div>

      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Ação de Emenda</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome da Ação</Label>
              <Input
                value={actionForm.nome_acao || ''}
                onChange={(e) =>
                  setActionForm({ ...actionForm, nome_acao: e.target.value })
                }
                placeholder="Ex: Cirurgias Eletivas"
              />
            </div>
            <div className="grid gap-2">
              <Label>Área</Label>
              <Input
                value={actionForm.area || ''}
                onChange={(e) =>
                  setActionForm({ ...actionForm, area: e.target.value })
                }
                placeholder="Ex: Atenção Especializada"
              />
            </div>
            <div className="grid gap-2">
              <Label>Complexidade</Label>
              <Input
                value={actionForm.complexidade || ''}
                onChange={(e) =>
                  setActionForm({ ...actionForm, complexidade: e.target.value })
                }
                placeholder="Ex: Média/Alta"
              />
            </div>
            <div className="grid gap-2">
              <Label>Público Alvo</Label>
              <Input
                value={actionForm.publico_alvo || ''}
                onChange={(e) =>
                  setActionForm({ ...actionForm, publico_alvo: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Descrição Oficial</Label>
              <Input
                value={actionForm.descricao_oficial || ''}
                onChange={(e) =>
                  setActionForm({
                    ...actionForm,
                    descricao_oficial: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAction}>Criar Ação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
