import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit2, Save, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface EmendaObjetoFinalidadeProps {
  description: string
  onSave: (description: string) => void
}

export const EmendaObjetoFinalidade = ({
  description,
  onSave,
}: EmendaObjetoFinalidadeProps) => {
  const { checkPermission } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(description)

  const canEdit = checkPermission(['ADMIN', 'GESTOR', 'ANALISTA'])

  useEffect(() => {
    setText(description)
  }, [description])

  const handleSave = () => {
    onSave(text)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setText(description)
    setIsEditing(false)
  }

  return (
    <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200 text-base">
          Objeto e Finalidade (Descrição Completa)
        </CardTitle>
        {canEdit && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Editar
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8"
            >
              <X className="h-3.5 w-3.5 mr-1.5" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} className="h-8">
              <Save className="h-3.5 w-3.5 mr-1.5" /> Salvar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        {isEditing ? (
          <Textarea
            value={text || ''}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] font-normal leading-relaxed"
            placeholder="Descreva detalhadamente o objeto e a finalidade desta emenda..."
          />
        ) : (
          <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {text || (
              <span className="text-neutral-400 italic">
                Nenhuma descrição informada.
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
