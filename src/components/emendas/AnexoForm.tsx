import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Upload, Loader2, FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Anexo } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { uploadFile } from '@/lib/supabase/storage'
import { useToast } from '@/components/ui/use-toast'

const anexoSchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório.'),
  url: z.string().min(1, 'A URL ou arquivo é obrigatório.'),
  tipo: z.enum(
    [
      'PORTARIA',
      'DELIBERACAO_CIE',
      'COMPROVANTE_FNS',
      'NOTA_FISCAL',
      'OFICIO',
      'PROPOSTA',
      'OUTRO',
    ],
    {
      required_error: 'O tipo é obrigatório.',
    },
  ),
  data: z.date({ required_error: 'A data é obrigatória.' }),
})

type AnexoFormValues = z.infer<typeof anexoSchema>

interface AnexoFormProps {
  anexo?: Anexo | null
  onSubmit: (values: Anexo) => void
  onCancel: () => void
}

export const AnexoForm = ({ anexo, onSubmit, onCancel }: AnexoFormProps) => {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<AnexoFormValues>({
    resolver: zodResolver(anexoSchema),
    defaultValues: {
      titulo: anexo?.titulo || '',
      url: anexo?.url || '',
      tipo: anexo?.tipo || 'OUTRO',
      data: anexo?.data
        ? new Date(anexo.data)
        : anexo?.created_at
          ? new Date(anexo.created_at)
          : new Date(),
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      // Auto-fill title if empty
      if (!form.getValues('titulo')) {
        form.setValue('titulo', file.name)
      }
    }
  }

  const handleSubmit = async (values: AnexoFormValues) => {
    let finalUrl = values.url

    if (selectedFile) {
      setIsUploading(true)
      try {
        // Generate a unique path: emendas/{timestamp}_{filename}
        // Note: In a real app, we might want to organize by emenda ID, but we might not have it here if it's new.
        // We'll use a generic 'uploads' folder or similar structure.
        const path = `uploads/${Date.now()}_${selectedFile.name}`
        const uploadedPath = await uploadFile(selectedFile, path)

        if (!uploadedPath) {
          throw new Error('Falha no upload do arquivo.')
        }
        finalUrl = uploadedPath
      } catch (error: any) {
        toast({
          title: 'Erro no upload',
          description: error.message,
          variant: 'destructive',
        })
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    const newAnexo: Anexo = {
      id: anexo?.id || `A-${Date.now()}`,
      ...values,
      url: finalUrl,
      created_at: anexo?.created_at || new Date().toISOString(),
      data: values.data.toISOString(),
      uploader: anexo?.uploader || 'Usuário Atual',
    }
    onSubmit(newAnexo)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Portaria 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Arquivo ou Link</FormLabel>
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://..."
                          {...field}
                          disabled={!!selectedFile}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Cole um link externo (Google Drive, etc.) ou faça upload.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant={selectedFile ? 'secondary' : 'outline'}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {selectedFile ? (
                  <FileIcon className="h-4 w-4 mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {selectedFile ? 'Alterar' : 'Upload'}
              </Button>
            </div>
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Arquivo selecionado:{' '}
              <span className="font-medium">{selectedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-destructive"
                onClick={() => {
                  setSelectedFile(null)
                  form.setValue('url', '')
                }}
              >
                Remover
              </Button>
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Documento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PORTARIA">Portaria</SelectItem>
                  <SelectItem value="DELIBERACAO_CIE">
                    Deliberação CIE
                  </SelectItem>
                  <SelectItem value="COMPROVANTE_FNS">
                    Comprovante FNS
                  </SelectItem>
                  <SelectItem value="NOTA_FISCAL">Nota Fiscal</SelectItem>
                  <SelectItem value="OFICIO">Ofício de Envio</SelectItem>
                  <SelectItem value="PROPOSTA">Proposta</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Documento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  )
}
