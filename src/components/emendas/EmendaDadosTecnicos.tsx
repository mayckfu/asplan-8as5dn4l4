import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import { CalendarIcon, Edit, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DetailedAmendment } from '@/lib/mock-data'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface EmendaDadosTecnicosProps {
  emenda: DetailedAmendment
  onEmendaChange: (updatedEmenda: DetailedAmendment) => void
}

export interface EmendaDadosTecnicosHandles {
  triggerEditAndFocus: (fieldId: string) => void
}

const situacaoRecursoOptions = [
  'Paga',
  'Empenhada',
  'Aguardando Repasse',
  'Não Repassado',
]

export const EmendaDadosTecnicos = forwardRef<
  EmendaDadosTecnicosHandles,
  EmendaDadosTecnicosProps
>(({ emenda, onEmendaChange }, ref) => {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editableEmenda, setEditableEmenda] = useState(emenda)
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({})

  useImperativeHandle(ref, () => ({
    triggerEditAndFocus: (fieldId: string) => {
      setIsEditing(true)
      setTimeout(() => {
        const field = fieldRefs.current[fieldId]
        if (field) {
          field.focus()
          field.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    },
  }))

  useEffect(() => {
    if (!isEditing) {
      setEditableEmenda(emenda)
    }
  }, [emenda, isEditing])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    const updatedEmenda = { ...editableEmenda, [name]: value }
    setEditableEmenda(updatedEmenda)
    onEmendaChange(updatedEmenda)
  }

  const handleValueChange = (
    name: string,
    value: string | number | Date | undefined,
  ) => {
    const updatedEmenda = { ...editableEmenda, [name]: value }
    setEditableEmenda(updatedEmenda)
    onEmendaChange(updatedEmenda)
  }

  const handleSave = () => {
    onEmendaChange(editableEmenda)
    setIsEditing(false)
    toast({ title: 'Dados técnicos salvos com sucesso!' })
  }

  const handleCancel = () => {
    setEditableEmenda(emenda)
    onEmendaChange(emenda)
    setIsEditing(false)
  }

  const DetailItem = ({
    label,
    value,
  }: {
    label: string
    value: React.ReactNode
  }) => (
    <div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-base font-medium text-neutral-900 dark:text-neutral-200">
        {value || '-'}
      </p>
    </div>
  )

  return (
    <Card className="rounded-xl border border-neutral-200 p-4 shadow-sm bg-white dark:bg-card">
      <CardHeader className="p-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-asplan-deep">
          📘 Dados Técnicos da Emenda
        </CardTitle>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="natureza">Natureza</Label>
                <Input
                  id="natureza"
                  name="natureza"
                  ref={(el) => (fieldRefs.current['natureza'] = el)}
                  value={editableEmenda.natureza || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="objeto_emenda">Objeto</Label>
                <Input
                  id="objeto_emenda"
                  name="objeto_emenda"
                  ref={(el) => (fieldRefs.current['objeto_emenda'] = el)}
                  value={editableEmenda.objeto_emenda || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="meta_operacional">Meta Operacional</Label>
                <Input
                  id="meta_operacional"
                  name="meta_operacional"
                  ref={(el) => (fieldRefs.current['meta_operacional'] = el)}
                  value={editableEmenda.meta_operacional || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="destino_recurso">
                  Destino do Recurso / Responsável
                </Label>
                <Input
                  id="destino_recurso"
                  name="destino_recurso"
                  ref={(el) => (fieldRefs.current['destino_recurso'] = el)}
                  value={editableEmenda.destino_recurso || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="data_repasse">Data do Repasse</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !editableEmenda.data_repasse && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editableEmenda.data_repasse ? (
                        format(new Date(editableEmenda.data_repasse), 'PPP', {
                          locale: ptBR,
                        })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={
                        editableEmenda.data_repasse
                          ? new Date(editableEmenda.data_repasse)
                          : undefined
                      }
                      onSelect={(date) =>
                        handleValueChange('data_repasse', date?.toISOString())
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="valor_repasse">Valor do Repasse</Label>
                <Input
                  id="valor_repasse"
                  name="valor_repasse"
                  type="number"
                  ref={(el) => (fieldRefs.current['valor_repasse'] = el)}
                  value={editableEmenda.valor_repasse || ''}
                  onChange={(e) =>
                    handleValueChange(
                      'valor_repasse',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="portaria">Portaria</Label>
                <Input
                  id="portaria"
                  name="portaria"
                  ref={(el) => (fieldRefs.current['portaria'] = el)}
                  value={editableEmenda.portaria || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="deliberacao_cie">Deliberação CIE</Label>
                <Input
                  id="deliberacao_cie"
                  name="deliberacao_cie"
                  ref={(el) => (fieldRefs.current['deliberacao_cie'] = el)}
                  value={editableEmenda.deliberacao_cie || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="situacao_recurso">Situação do Recurso</Label>
                <Select
                  value={editableEmenda.situacao_recurso || ''}
                  onValueChange={(value) =>
                    handleValueChange('situacao_recurso', value)
                  }
                >
                  <SelectTrigger
                    ref={(el) => (fieldRefs.current['situacao_recurso'] = el)}
                  >
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    {situacaoRecursoOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  ref={(el) => (fieldRefs.current['observacoes'] = el)}
                  value={editableEmenda.observacoes || ''}
                  onChange={handleInputChange}
                />
              </div>
            </>
          ) : (
            <>
              <DetailItem label="Natureza" value={emenda.natureza} />
              <DetailItem label="Objeto" value={emenda.objeto_emenda} />
              <DetailItem
                label="Meta Operacional"
                value={emenda.meta_operacional}
              />
              <DetailItem
                label="Destino do Recurso / Responsável pelo Gasto"
                value={emenda.destino_recurso}
              />
              <DetailItem
                label="Data do Repasse"
                value={
                  emenda.data_repasse
                    ? new Date(emenda.data_repasse).toLocaleDateString('pt-BR')
                    : '-'
                }
              />
              <DetailItem
                label="Valor do Repasse"
                value={
                  emenda.valor_repasse
                    ? formatCurrencyBRL(emenda.valor_repasse)
                    : '-'
                }
              />
              <DetailItem label="Portaria" value={emenda.portaria} />
              <DetailItem
                label="Deliberação CIE"
                value={emenda.deliberacao_cie}
              />
              <DetailItem
                label="Situação do Recurso"
                value={emenda.situacao_recurso}
              />
              <div className="md:col-span-2">
                <DetailItem label="Observações" value={emenda.observacoes} />
              </div>
            </>
          )}
        </div>
        {isEditing && (
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
