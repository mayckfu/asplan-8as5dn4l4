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
import { DetailedAmendment, TipoEmenda, TipoRecurso } from '@/lib/mock-data'
import { Edit2, Save, X, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MoneyInput } from '@/components/ui/money-input'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { formatDisplayDate } from '@/lib/date-utils'
import { ExpandableText } from '@/components/ui/expandable-text'

interface EmendaDadosTecnicosProps {
  emenda: DetailedAmendment
  onEmendaChange: (emenda: DetailedAmendment) => void
}

export interface EmendaDadosTecnicosHandles {
  triggerEditAndFocus: (fieldId: string) => void
}

const ReadOnlyField = ({
  label,
  value,
  className,
  fullWidth = false,
  isExpandable = false,
}: {
  label: string
  value: string | number | null | undefined
  className?: string
  fullWidth?: boolean
  isExpandable?: boolean
}) => (
  <div
    className={cn(
      'flex flex-col gap-1.5 p-3 rounded-lg border border-transparent hover:bg-neutral-50/80 hover:border-neutral-100 transition-colors',
      fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : '',
      className,
    )}
  >
    <dt className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
      {label}
    </dt>
    <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">
      {isExpandable ? (
        <ExpandableText text={value ? String(value) : null} limit={150} />
      ) : (
        value || <span className="text-muted-foreground/50 italic">-</span>
      )}
    </dd>
  </div>
)

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
      <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Info className="h-4 w-4" />
          </div>
          <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200 text-lg">
            Dados Técnicos
          </CardTitle>
        </div>
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
      <CardContent className="pt-6 pb-6">
        {isEditing ? (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="natureza">Natureza da Despesa</Label>
                <Input
                  id="natureza"
                  value={formData.natureza || ''}
                  onChange={(e) => handleChange('natureza', e.target.value)}
                  placeholder="Ex: 33.90.30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_operacional">Meta Operacional</Label>
                <Input
                  id="meta_operacional"
                  value={formData.meta_operacional || ''}
                  onChange={(e) =>
                    handleChange('meta_operacional', e.target.value)
                  }
                  placeholder="Ex: 100% executado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destino_recurso">Unidade de Destino</Label>
                <Input
                  id="destino_recurso"
                  value={formData.destino_recurso || ''}
                  onChange={(e) =>
                    handleChange('destino_recurso', e.target.value)
                  }
                  placeholder="Ex: Fundo Municipal de Saúde"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portaria">Nº Portaria</Label>
                <Input
                  id="portaria"
                  value={formData.portaria || ''}
                  onChange={(e) => handleChange('portaria', e.target.value)}
                  placeholder="Digite o número"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliberacao_cie">Deliberação CIE</Label>
                <Input
                  id="deliberacao_cie"
                  value={formData.deliberacao_cie || ''}
                  onChange={(e) =>
                    handleChange('deliberacao_cie', e.target.value)
                  }
                  placeholder="Digite o número"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_repasse">Data Prevista Repasse</Label>
                <Input
                  id="data_repasse"
                  type="date"
                  value={formData.data_repasse || ''}
                  onChange={(e) => handleChange('data_repasse', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_repasse">
                  Valor do Repasse Previsto (R$)
                </Label>
                <MoneyInput
                  id="valor_repasse"
                  value={formData.valor_repasse || 0}
                  onChange={(val) => handleChange('valor_repasse', val)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="objeto_emenda">Objeto (Resumido)</Label>
              <Input
                id="objeto_emenda"
                value={formData.objeto_emenda || ''}
                onChange={(e) => handleChange('objeto_emenda', e.target.value)}
                placeholder="Ex: Aquisição de equipamentos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações Gerais</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                className="min-h-[100px]"
                placeholder="Adicione observações importantes..."
              />
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
            {/* Core Identification Fields (Read Only Context) */}
            <ReadOnlyField
              label="Número da Emenda"
              value={emenda.numero_emenda}
            />
            <ReadOnlyField
              label="Ano de Exercício"
              value={emenda.ano_exercicio}
            />
            <ReadOnlyField
              label="Número da Proposta"
              value={emenda.numero_proposta}
            />

            <ReadOnlyField
              label="Valor Total"
              value={formatCurrencyBRL(emenda.valor_total || 0)}
            />
            <ReadOnlyField
              label="Tipo de Recurso"
              value={
                TipoRecurso[emenda.tipo_recurso] || emenda.tipo_recurso || '-'
              }
            />
            <ReadOnlyField
              label="Tipo de Emenda"
              value={TipoEmenda[emenda.tipo] || emenda.tipo || '-'}
            />

            <ReadOnlyField
              label="Parlamentar"
              value={emenda.parlamentar}
              className="md:col-span-2"
            />
            <ReadOnlyField label="Autor" value={emenda.autor} />

            <div className="col-span-full border-t border-neutral-100 dark:border-neutral-800 my-2" />

            {/* Editable Technical Fields Display */}
            <ReadOnlyField
              label="Natureza da Despesa"
              value={emenda.natureza}
            />
            <ReadOnlyField
              label="Meta Operacional"
              value={emenda.meta_operacional}
            />
            <ReadOnlyField
              label="Unidade de Destino"
              value={emenda.destino_recurso}
            />

            <ReadOnlyField label="Portaria" value={emenda.portaria} />
            <ReadOnlyField
              label="Deliberação CIE"
              value={emenda.deliberacao_cie}
            />
            <ReadOnlyField
              label="Data Prev. Repasse"
              value={
                emenda.data_repasse
                  ? formatDisplayDate(emenda.data_repasse)
                  : null
              }
            />

            <ReadOnlyField
              label="Objeto (Resumido)"
              value={emenda.objeto_emenda}
              fullWidth
              isExpandable
            />

            <ReadOnlyField
              label="Observações Gerais"
              value={emenda.observacoes}
              fullWidth
              isExpandable
            />
          </dl>
        )}
      </CardContent>
    </Card>
  )
})
EmendaDadosTecnicos.displayName = 'EmendaDadosTecnicos'
