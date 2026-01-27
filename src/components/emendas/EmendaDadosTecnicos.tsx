import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { DetailedAmendment } from '@/lib/mock-data'
import { Edit2, Save, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoneyInput } from '@/components/ui/money-input'

interface EmendaDadosTecnicosProps {
  emenda: DetailedAmendment
  onEmendaChange: (emenda: DetailedAmendment) => void
}

export interface EmendaDadosTecnicosHandles {
  triggerEditAndFocus: (fieldId: string) => void
}

export const EmendaDadosTecnicos = forwardRef<
  EmendaDadosTecnicosHandles,
  EmendaDadosTecnicosProps
>(({ emenda, onEmendaChange }, ref) => {
  const { checkPermission } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<DetailedAmendment>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const canEdit = checkPermission(['ADMIN', 'GESTOR', 'ANALISTA'])

  useEffect(() => {
    setFormData(emenda)
  }, [emenda])

  useImperativeHandle(ref, () => ({
    triggerEditAndFocus: (fieldId) => {
      if (canEdit) {
        setIsEditing(true)
        setTimeout(() => {
          const element = containerRef.current?.querySelector(`#${fieldId}`)
          if (element instanceof HTMLElement) {
            element.focus()
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
    },
  }))

  const handleChange = (field: keyof DetailedAmendment, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onEmendaChange({ ...emenda, ...formData } as DetailedAmendment)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(emenda)
    setIsEditing(false)
  }

  return (
    <Card
      className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800"
      ref={containerRef}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
          Dados Técnicos
        </CardTitle>
        {canEdit && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Salvar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="natureza">Natureza da Despesa</Label>
            <Input
              id="natureza"
              value={formData.natureza || ''}
              onChange={(e) => handleChange('natureza', e.target.value)}
              disabled={!isEditing}
              className={
                !isEditing
                  ? 'border-transparent bg-transparent px-0 shadow-none'
                  : ''
              }
              placeholder={isEditing ? 'Ex: 33.90.30' : '-'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objeto">Objeto (Resumido)</Label>
            <Input
              id="objeto"
              value={formData.objeto_emenda || ''}
              onChange={(e) => handleChange('objeto_emenda', e.target.value)}
              disabled={!isEditing}
              className={
                !isEditing
                  ? 'border-transparent bg-transparent px-0 shadow-none'
                  : ''
              }
              placeholder={isEditing ? 'Ex: Aquisição de equipamentos' : '-'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta">Meta Operacional</Label>
            <Input
              id="meta"
              value={formData.meta_operacional || ''}
              onChange={(e) => handleChange('meta_operacional', e.target.value)}
              disabled={!isEditing}
              className={
                !isEditing
                  ? 'border-transparent bg-transparent px-0 shadow-none'
                  : ''
              }
              placeholder={isEditing ? 'Ex: 100% executado' : '-'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destino">Unidade de Destino</Label>
            <Input
              id="destino"
              value={formData.destino_recurso || ''}
              onChange={(e) => handleChange('destino_recurso', e.target.value)}
              disabled={!isEditing}
              className={
                !isEditing
                  ? 'border-transparent bg-transparent px-0 shadow-none'
                  : ''
              }
              placeholder={isEditing ? 'Ex: Fundo Municipal de Saúde' : '-'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portaria">Nº Portaria</Label>
            <Input
              id="portaria"
              value={formData.portaria || ''}
              onChange={(e) => handleChange('portaria', e.target.value)}
              disabled={!isEditing}
              className={
                !isEditing
                  ? 'border-transparent bg-transparent px-0 shadow-none'
                  : ''
              }
              placeholder={isEditing ? 'Digite o número' : '-'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cie">Deliberação CIE</Label>
            <Input
              id="cie"
              value={formData.deliberacao_cie || ''}
              onChange={(e) => handleChange('deliberacao_cie', e.target.value)}
              disabled={!isEditing}
              className={
                !isEditing
                  ? 'border-transparent bg-transparent px-0 shadow-none'
                  : ''
              }
              placeholder={isEditing ? 'Digite o número' : '-'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor_repasse">
              Valor do Repasse Previsto (R$)
            </Label>
            {isEditing ? (
              <MoneyInput
                id="valor_repasse"
                value={formData.valor_repasse || 0}
                onChange={(val) => handleChange('valor_repasse', val)}
              />
            ) : (
              <div className="py-2 text-sm font-medium">
                {formData.valor_repasse
                  ? new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(formData.valor_repasse)
                  : '-'}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="data_repasse">Data Prevista Repasse</Label>
            <Input
              id="data_repasse"
              type="date"
              value={formData.data_repasse || ''}
              onChange={(e) => handleChange('data_repasse', e.target.value)}
              disabled={!isEditing}
              className={
                !isEditing
                  ? 'border-transparent bg-transparent px-0 shadow-none'
                  : ''
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações Gerais</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes || ''}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            disabled={!isEditing}
            className={
              !isEditing
                ? 'border-transparent bg-transparent px-0 shadow-none resize-none min-h-[60px]'
                : 'min-h-[100px]'
            }
            placeholder={
              isEditing ? 'Adicione observações importantes...' : '-'
            }
          />
        </div>
      </CardContent>
    </Card>
  )
})
