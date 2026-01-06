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
  Send,
  FileCode,
  Download,
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
import { formatBytes } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

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
  OFICIO: Send,
  PROPOSTA: FileCode,
  OUTRO: FileQuestion,
}

export const EmendaAnexosTab = ({
  anexos,
  onAnexosChange,
}: EmendaAnexosTabProps) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAnexo, setSelectedAnexo] = useState<Anexo | null>(null)

  const isReadOnly = user?.role === 'CONSULTA'

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
            {!isReadOnly && (
              <Button size="sm" onClick={handleAddNew}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Anexo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {anexos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isReadOnly
                ? 'Nenhum anexo registrado.'
                : 'Nenhum anexo registrado. Clique em "Adicionar Anexo" para começar.'}
            </div>
          ) : (
            <ul className="space-y-3">
              {anexos.map((anexo) => {
                const Icon = anexoIcons[anexo.tipo] || FileQuestion
                const displayDate = anexo.data
                  ? new Date(anexo.data).toLocaleDateString('pt-BR')
                  : new Date(anexo.created_at).toLocaleDateString('pt-BR')

                return (
                  <li
                    key={anexo.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 dark:hover:bg-muted/50 transition-colors gap-3 sm:gap-0"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex-shrink-0 bg-neutral-100 p-2 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <a
                          href={anexo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-neutral-900 dark:text-neutral-200 hover:underline flex items-center gap-1 truncate"
                        >
                          {anexo.filename}
                          <ExternalLink className="h-3 w-3 opacity-50 flex-shrink-0" />
                        </a>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          {anexo.tipo} • {displayDate} • {anexo.uploader}
                          {anexo.size && anexo.size > 0 && (
                            <span> • {formatBytes(anexo.size)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-neutral-800">
                      <a
                        href={anexo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        title="Baixar/Visualizar"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                      {!isReadOnly && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground"
                            onClick={() => handleEdit(anexo)}
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(anexo)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAnexo ? 'Editar Anexo' : 'Adicionar Anexo'}
            </DialogTitle>
            <DialogDescription>
              Insira os detalhes do documento ou link.
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
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o anexo "{selectedAnexo?.filename}
              "? Esta ação não pode ser desfeita.
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
