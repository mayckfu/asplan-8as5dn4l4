import { Upload, File, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Anexo } from '@/lib/mock-data'

interface EmendaAnexosTabProps {
  anexos: Anexo[]
}

export const EmendaAnexosTab = ({ anexos }: EmendaAnexosTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Arraste e solte arquivos aqui ou
          </p>
          <Button variant="outline" className="mt-2">
            Selecione os arquivos
          </Button>
        </div>
        <ul className="space-y-2">
          {anexos.map((anexo) => (
            <li
              key={anexo.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <File className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{anexo.titulo}</p>
                  <p className="text-xs text-muted-foreground">
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
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
