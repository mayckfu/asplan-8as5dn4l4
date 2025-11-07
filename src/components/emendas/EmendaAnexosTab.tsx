import { useState } from 'react'
import {
  File,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface EmendaAnexosTabProps {
  anexos: Anexo[]
}

type AnexoType = Anexo['tipo']

const anexoIcons: Record<AnexoType, React.ElementType> = {
  PORTARIA: FileText,
  DELIBERACAO_CIE: ShieldCheck,
  COMPROVANTE_FNS: Paperclip,
  NOTA_FISCAL: FileText,
  OUTRO: FileQuestion,
}

export const EmendaAnexosTab = ({ anexos }: EmendaAnexosTabProps) => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [anexoType, setAnexoType] = useState<AnexoType>('OUTRO')
  const [isEssential, setIsEssential] = useState(false)

  const handleUpload = () => {
    console.log('Uploading:', {
      files: filesToUpload,
      type: anexoType,
      essential: isEssential,
    })
    setFilesToUpload([])
  }

  return (
    <Card className="rounded-2xl shadow-sm border border-neutral-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-medium text-neutral-800">
            Anexos ({anexos.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg space-y-4">
          <h4 className="font-semibold text-neutral-800">Novo Anexo</h4>
          <FileUpload onFilesAccepted={setFilesToUpload} />
          {filesToUpload.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-neutral-600">Tipo de Anexo</Label>
                <Select
                  value={anexoType}
                  onValueChange={(v) => setAnexoType(v as AnexoType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PORTARIA">Portaria</SelectItem>
                    <SelectItem value="DELIBERACAO_CIE">
                      Deliberação CIE
                    </SelectItem>
                    <SelectItem value="COMPROVANTE_FNS">
                      Comprovante FNS
                    </SelectItem>
                    <SelectItem value="NOTA_FISCAL">Nota Fiscal</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="essential"
                  checked={isEssential}
                  onCheckedChange={(c) => setIsEssential(Boolean(c))}
                />
                <Label htmlFor="essential" className="text-neutral-600">
                  Anexo essencial
                </Label>
              </div>
              <Button onClick={handleUpload}>
                <FileUp className="mr-2 h-4 w-4" />
                Enviar {filesToUpload.length} arquivo(s)
              </Button>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-neutral-800">
            Anexos Enviados
          </h4>
          <ul className="space-y-2">
            {anexos.map((anexo) => {
              const Icon = anexoIcons[anexo.tipo] || File
              return (
                <li
                  key={anexo.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium text-neutral-800">
                        {anexo.titulo}
                      </p>
                      <p className="text-xs text-neutral-600">
                        Tipo: {anexo.tipo} | Enviado por {anexo.uploader} em{' '}
                        {new Date(anexo.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
