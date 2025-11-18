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

interface EmendaObjetoFinalidadeProps {
  description: string
  onSave: (newDescription: string) => void
}

export const EmendaObjetoFinalidade = ({
  description,
  onSave,
}: EmendaObjetoFinalidadeProps) => {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [tempDescription, setTempDescription] = useState(description)

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSave(tempDescription)
    setIsEditing(false)
    toast({ title: 'Finalidade atualizada com sucesso!' })
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTempDescription(description)
    setIsEditing(false)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="text-lg font-semibold text-asplan-primary hover:no-underline group">
          <div className="flex items-center justify-between w-full pr-4">
            <span>📄 Objeto e Finalidade</span>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleEditClick}
              >
                <Edit className="h-4 w-4 mr-2" /> Editar
              </Button>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-neutral-800 dark:text-neutral-300 leading-relaxed text-justify p-1">
          {isEditing ? (
            <div className="space-y-4">
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
