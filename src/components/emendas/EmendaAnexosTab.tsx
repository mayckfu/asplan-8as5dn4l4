import { useState } from 'react'
import {
  ExternalLink,
  Trash2,
  FileText,
  ShieldCheck,
  Paperclip,
  FileQuestion,
  PlusCircle,
  Edit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Anexo } from '@/lib/mock-data'
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
import { useToast } from '@/components/ui/use-toast'
import { AnexoForm } from './AnexoForm'

interface EmendaAnexosTabProps {
  anexos: Anexo[]
  onAnexosChange: (anexos: Anexo[]) => void
}

type AnexoType = Anexo['tipo']

const anexoIcons: Record<AnexoType, React.ElementType> = {
  PORTARIA: FileText,
  DELIBERACAO_CIE: ShieldCheck,
  COMPROVANTE_FNS: Paperclip,
  NOTA_FISCAL: FileText,
  OUTRO: FileQuestion,
}

export const EmendaAnexosTab = ({
  anexos,
  onAnexosChange,
}: EmendaAnexosTabProps) => {
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAnexo, setSelectedAnexo] = useState<Anexo | null>(null)

  const handleAddNew = () => {
    setSelectedAnexo(null)
    setIsFormOpen(true)
  }

  const handleEdit = (anexo: Anexo) => {
    setSelectedAnexo(anexo)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (anexo: Anexo) => {
    setSelectedAnexo(anexo)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedAnexo) {
      onAnexosChange(anexos.filter((a) => a.id !== selectedAnexo.id))
      toast({ title: 'Anexo excluído com sucesso!' })
    }
    setIsDeleteDialogOpen(false)
    setSelectedAnexo(null)
  }

  const handleFormSubmit = (anexo: Anexo) => {
    if (selectedAnexo) {
      onAnexosChange(anexos.map((a) => (a.id === anexo.id ? anexo : a)))
      toast({ title: 'Anexo atualizado com sucesso!' })
    } else {
      onAnexosChange([...anexos, anexo])
      toast({ title: 'Anexo adicionado com sucesso!' })
    }
    setIsFormOpen(false)
    setSelectedAnexo(null)
  }

  return (
    <>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Anexos ({anexos.length})
            </CardTitle>
            <Button size="sm" onClick={handleAddNew}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {anexos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum anexo registrado. Clique em "Adicionar Link" para começar.
            </div>
          ) : (
            <ul className="space-y-2">
              {anexos.map((anexo) => {
                const Icon = anexoIcons[anexo.tipo]
                const displayDate = anexo.data
                  ? new Date(anexo.data).toLocaleDateString('pt-BR')
                  : new Date(anexo.created_at).toLocaleDateString('pt-BR')

                return (
                  <li
                    key={anexo.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Icon className="h-6 w-6 text-primary shrink-0" />
                      <div className="min-w-0">
                        <a
                          href={anexo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-neutral-900 dark:text-neutral-200 hover:underline flex items-center gap-1 truncate"
                        >
                          {anexo.titulo}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          {anexo.tipo} • {displayDate} • Por {anexo.uploader}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(anexo)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(anexo)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAnexo ? 'Editar Anexo' : 'Adicionar Anexo'}
            </DialogTitle>
            <DialogDescription>
              Insira os detalhes do documento ou link do Google Drive.
            </DialogDescription>
          </DialogHeader>
          <AnexoForm
            anexo={selectedAnexo}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o anexo "{selectedAnexo?.titulo}"?
              Esta ação não pode ser desfeita.
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
}
