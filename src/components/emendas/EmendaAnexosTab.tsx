import { useState } from 'react'
import { FileText, Trash2, ExternalLink, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Anexo } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { AnexoForm } from './AnexoForm'
import { formatDateToDB, formatDisplayDate } from '@/lib/date-utils'

interface EmendaAnexosTabProps {
  anexos: Anexo[]
  onAnexosChange: (anexos: Anexo[]) => void
  emendaId: string
}

const DOCUMENT_TYPES = {
  PORTARIA: 'Portaria',
  DELIBERACAO_CIE: 'Deliberação CIE',
  COMPROVANTE_FNS: 'Comprovante FNS',
  NOTA_FISCAL: 'Nota Fiscal',
  OFICIO: 'Ofício',
  PROPOSTA: 'Proposta',
  OUTRO: 'Outro',
}

export const EmendaAnexosTab = ({
  anexos,
  onAnexosChange,
  emendaId,
}: EmendaAnexosTabProps) => {
  const { toast } = useToast()
  const { user, checkPermission } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canEdit = checkPermission(['ADMIN', 'GESTOR', 'ANALISTA'])

  const handleSaveAnexo = async (values: any) => {
    if (!emendaId) {
      toast({
        title: 'Erro',
        description: 'Emenda não identificada.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('anexos').insert({
        emenda_id: emendaId,
        tipo: values.tipo,
        filename: values.filename,
        url: values.url,
        data_documento: formatDateToDB(values.data),
        uploader: user?.id,
      })

      if (error) throw error

      // Call parent to refresh data
      onAnexosChange([...anexos]) // The parent refreshData will actually reload everything
      setIsFormOpen(false)
      toast({ title: 'Anexo adicionado com sucesso!' })
    } catch (error: any) {
      console.error('Error saving anexo:', error)
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Falha ao salvar anexo.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (anexo: Anexo) => {
    if (!canEdit) return
    if (confirm(`Tem certeza que deseja excluir "${anexo.filename}"?`)) {
      try {
        const { error } = await supabase
          .from('anexos')
          .delete()
          .eq('id', anexo.id)

        if (error) throw error

        toast({ title: 'Anexo excluído com sucesso!' })
        onAnexosChange(anexos.filter((a) => a.id !== anexo.id))
      } catch (error: any) {
        toast({
          title: 'Erro ao excluir',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Documentos e Links
            </CardTitle>
            {canEdit && (
              <Button size="sm" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Link/Anexo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {anexos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum documento registrado.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título / Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Doc.</TableHead>
                    <TableHead>Enviado por</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anexos.map((anexo) => (
                    <TableRow
                      key={anexo.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <a
                          href={anexo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline cursor-pointer"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate max-w-[200px] md:max-w-[400px]">
                            {anexo.filename}
                          </span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-normal whitespace-nowrap"
                        >
                          {DOCUMENT_TYPES[
                            anexo.tipo as keyof typeof DOCUMENT_TYPES
                          ] || anexo.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDisplayDate(anexo.data)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {anexo.uploader || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(anexo)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Documento</DialogTitle>
            <DialogDescription>
              Insira o link para o documento externo.
            </DialogDescription>
          </DialogHeader>
          <AnexoForm
            onSubmit={handleSaveAnexo}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
