import { useState } from 'react'
import {
  Download,
  Trash2,
  FileText,
  ShieldCheck,
  Paperclip,
  FileQuestion,
  FileUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Anexo } from '@/lib/mock-data'
import { FileUpload } from '@/components/FileUpload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]

export const EmendaAnexosTab = ({
  anexos,
  onAnexosChange,
}: EmendaAnexosTabProps) => {
  const { toast } = useToast()
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [attachmentToDelete, setAttachmentToDelete] = useState<Anexo | null>(
    null,
  )

  const handleFilesAccepted = (files: File[]) => {
    const validatedFiles = files.filter((file) => {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Arquivo inválido',
          description: `Tipo de arquivo não suportado: ${file.name}`,
        })
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: `O arquivo ${file.name} excede o limite de 25MB.`,
        })
        return false
      }
      return true
    })
    setFilesToUpload(validatedFiles)
  }

  const handleDeleteClick = (anexo: Anexo) => {
    setAttachmentToDelete(anexo)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (attachmentToDelete) {
      onAnexosChange(anexos.filter((a) => a.id !== attachmentToDelete.id))
      toast({ title: 'Anexo excluído com sucesso!' })
    }
    setIsDeleteDialogOpen(false)
    setAttachmentToDelete(null)
  }

  return (
    <>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
            Anexos ({anexos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-200">
              Novo Anexo
            </h4>
            <FileUpload onFilesAccepted={handleFilesAccepted} />
            {filesToUpload.length > 0 && (
              <div className="flex items-end gap-4">
                <Select defaultValue="OUTRO">
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Anexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <FileUp className="mr-2 h-4 w-4" />
                  Enviar {filesToUpload.length} arquivo(s)
                </Button>
              </div>
            )}
          </div>
          <ul className="space-y-2">
            {anexos.map((anexo) => {
              const Icon = anexoIcons[anexo.tipo]
              return (
                <li
                  key={anexo.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                      <a
                        href={anexo.url}
                        download={anexo.titulo}
                        className="font-medium text-neutral-900 dark:text-neutral-200 hover:underline"
                      >
                        {anexo.titulo}
                      </a>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {anexo.tipo} | {anexo.uploader} em{' '}
                        {new Date(anexo.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={anexo.url} download={anexo.titulo}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteClick(anexo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o anexo "
              {attachmentToDelete?.titulo}"? Esta ação não pode ser desfeita.
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
