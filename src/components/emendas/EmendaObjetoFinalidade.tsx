import { useState } from 'react'
import { Edit, Save, X } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface EmendaObjetoFinalidadeProps {
  description: string
  onSave: (newDescription: string) => void
}

export const EmendaObjetoFinalidade = ({
  description,
  onSave,
}: EmendaObjetoFinalidadeProps) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [tempDescription, setTempDescription] = useState(description)

  const isReadOnly = user?.role === 'CONSULTA'

  const handleSave = () => {
    onSave(tempDescription)
    setIsEditing(false)
    toast({ title: 'Finalidade atualizada com sucesso!' })
  }

  const handleCancel = () => {
    setTempDescription(description)
    setIsEditing(false)
  }

  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1" className="border-none relative">
        <AccordionTrigger className="text-lg font-semibold text-asplan-primary hover:no-underline group pr-20">
          <span>📄 Objeto e Finalidade</span>
        </AccordionTrigger>
        {!isEditing && !isReadOnly && (
          <div className="absolute right-4 top-3.5 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
          </div>
        )}
        <AccordionContent className="text-neutral-800 dark:text-neutral-300 leading-relaxed text-justify p-1">
          {isEditing ? (
            <div className="space-y-4 pt-2">
              <Textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                className="min-h-[150px]"
                placeholder="Descreva o objeto e a finalidade da emenda..."
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" /> Cancelar
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{description}</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
