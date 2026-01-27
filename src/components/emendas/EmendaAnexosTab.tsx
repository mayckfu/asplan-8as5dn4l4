import { useState, useRef } from 'react'
import {
  FileText,
  Upload,
  MoreHorizontal,
  Trash2,
  Download,
  Eye,
  Loader2,
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Anexo } from '@/lib/mock-data'
import { formatBytes } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface EmendaAnexosTabProps {
  anexos: Anexo[]
  onAnexosChange: (anexos: Anexo[]) => void
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
}: EmendaAnexosTabProps) => {
  const { toast } = useToast()
  const { checkPermission } = useAuth()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newAnexoType, setNewAnexoType] = useState<string>('OUTRO')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const canEdit = checkPermission(['ADMIN', 'GESTOR', 'ANALISTA'])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo para enviar.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    try {
      const fileName = `${Date.now()}_${selectedFile.name}`.replace(/\s+/g, '_')
      const { data, error } = await supabase.storage
        .from('emendas-docs')
        .upload(fileName, selectedFile)

      if (error) throw error

      // Get public URL or signed URL logic handles in detail page usually, but for record we need the path
      const { data: publicUrlData } = supabase.storage
        .from('emendas-docs')
        .getPublicUrl(data.path)

      const newAnexo: Anexo = {
        id: `A-${Date.now()}`, // Temporary ID, backend will assign real UUID
        tipo: newAnexoType as any,
        filename: selectedFile.name,
        url: publicUrlData.publicUrl, // Store public URL or path depending on architecture. Here public URL for simplicity.
        created_at: new Date().toISOString(),
        uploader: 'Eu', // UI optimistic update
        data: new Date().toISOString(),
        size: selectedFile.size,
        metadata: { path: data.path },
      }

      onAnexosChange([...anexos, newAnexo])
      setIsUploadOpen(false)
      setSelectedFile(null)
      toast({ title: 'Arquivo enviado com sucesso!' })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Erro no envio',
        description: error.message || 'Falha ao enviar arquivo.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (anexo: Anexo) => {
    if (!canEdit) return
    if (confirm(`Tem certeza que deseja excluir "${anexo.filename}"?`)) {
      onAnexosChange(anexos.filter((a) => a.id !== anexo.id))
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
              Documentos e Anexos
            </CardTitle>
            {canEdit && (
              <Button size="sm" onClick={() => setIsUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Novo Anexo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {anexos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum anexo encontrado.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Enviado por</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anexos.map((anexo) => (
                    <TableRow key={anexo.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="truncate max-w-[200px]">
                            {anexo.filename}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {DOCUMENT_TYPES[
                            anexo.tipo as keyof typeof DOCUMENT_TYPES
                          ] || anexo.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBytes(anexo.size || 0)}</TableCell>
                      <TableCell>{anexo.uploader || '-'}</TableCell>
                      <TableCell>
                        {new Date(anexo.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDownload(anexo.url)}
                            >
                              <Download className="mr-2 h-4 w-4" /> Baixar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(anexo.url, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" /> Visualizar
                            </DropdownMenuItem>
                            {canEdit && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(anexo)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Anexo</DialogTitle>
            <DialogDescription>
              Selecione o tipo de documento e o arquivo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Documento</Label>
              <Select value={newAnexoType} onValueChange={setNewAnexoType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
