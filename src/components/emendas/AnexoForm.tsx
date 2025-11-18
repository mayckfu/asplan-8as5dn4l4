import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

const anexoSchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório.'),
  url: z.string().url('Insira uma URL válida.'),
  tipo: z.enum(
    ['PORTARIA', 'DELIBERACAO_CIE', 'COMPROVANTE_FNS', 'NOTA_FISCAL', 'OUTRO'],
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

  const handleSubmit = (values: AnexoFormValues) => {
    const newAnexo: Anexo = {
      id: anexo?.id || `A-${Date.now()}`,
      ...values,
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
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL (Google Drive ou Link)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  )
}
