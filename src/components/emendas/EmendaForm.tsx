import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { MoneyInput } from '@/components/ui/money-input'
import {
  Amendment,
  TipoRecurso,
  SituacaoOficial,
  StatusInterno,
  TipoEmenda,
  TipoRecursoEnum,
  SituacaoOficialEnum,
  StatusInternoEnum,
  TipoEmendaEnum,
} from '@/lib/mock-data'

const emendaSchema = z.object({
  tipo: z.enum(['individual', 'bancada', 'comissao'], {
    required_error: 'O tipo é obrigatório.',
  }),
  tipo_recurso: z.string().min(1, 'O tipo de recurso é obrigatório.'),
  autor: z.string().min(1, 'O autor é obrigatório.'),
  parlamentar: z.string().min(1, 'O parlamentar é obrigatório.'),
  numero_emenda: z.string().min(1, 'O número da emenda é obrigatório.'),
  numero_proposta: z.string().min(1, 'O número da proposta é obrigatório.'),
  valor_total: z.coerce
    .number({ invalid_type_error: 'O valor deve ser um número.' })
    .min(0, 'O valor deve ser positivo.'),
  situacao: z.string().min(1, 'A situação oficial é obrigatória.'),
  status_interno: z.string().min(1, 'O status interno é obrigatório.'),
  portaria: z.string().optional().nullable(),
  deliberacao_cie: z.string().optional().nullable(),
  anexos_essenciais: z.boolean().default(false),
})

type EmendaFormValues = z.infer<typeof emendaSchema>

interface EmendaFormProps {
  initialData?: Amendment | null
  onSubmit: (data: Partial<Amendment>) => void
  onCancel: () => void
}

export const EmendaForm = ({
  initialData,
  onSubmit,
  onCancel,
}: EmendaFormProps) => {
  const form = useForm<EmendaFormValues>({
    resolver: zodResolver(emendaSchema),
    defaultValues: {
      tipo: initialData?.tipo || 'individual',
      tipo_recurso: initialData?.tipo_recurso || '',
      autor: initialData?.autor || '',
      parlamentar: initialData?.parlamentar || '',
      numero_emenda: initialData?.numero_emenda || '',
      numero_proposta: initialData?.numero_proposta || '',
      valor_total: initialData?.valor_total || 0,
      situacao: initialData?.situacao || 'EM_ANALISE',
      status_interno: initialData?.status_interno || 'RASCUNHO',
      portaria: initialData?.portaria || '',
      deliberacao_cie: initialData?.deliberacao_cie || '',
      anexos_essenciais: initialData?.anexos_essenciais || false,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        tipo: initialData.tipo,
        tipo_recurso: initialData.tipo_recurso,
        autor: initialData.autor,
        parlamentar: initialData.parlamentar,
        numero_emenda: initialData.numero_emenda,
        numero_proposta: initialData.numero_proposta,
        valor_total: initialData.valor_total,
        situacao: initialData.situacao,
        status_interno: initialData.status_interno,
        portaria: initialData.portaria || '',
        deliberacao_cie: initialData.deliberacao_cie || '',
        anexos_essenciais: initialData.anexos_essenciais,
      })
    }
  }, [initialData, form])

  const handleSubmit = (values: EmendaFormValues) => {
    onSubmit({
      ...values,
      tipo: values.tipo as TipoEmendaEnum,
      tipo_recurso: values.tipo_recurso as TipoRecursoEnum,
      situacao: values.situacao as SituacaoOficialEnum,
      status_interno: values.status_interno as StatusInternoEnum,
      portaria: values.portaria || null,
      deliberacao_cie: values.deliberacao_cie || null,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Emenda</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TipoEmenda).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipo_recurso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Recurso</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o recurso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TipoRecurso).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="autor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Autor</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do autor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parlamentar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parlamentar</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do parlamentar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="numero_emenda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Emenda</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 2025..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numero_proposta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nº Proposta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 12345..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="valor_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Total (R$)</FormLabel>
                <FormControl>
                  <MoneyInput
                    placeholder="0,00"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="situacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situação Oficial</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(SituacaoOficial).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status_interno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Interno</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(StatusInterno).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="portaria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portaria</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Número da portaria"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deliberacao_cie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deliberação CIE</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Número da deliberação"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="anexos_essenciais"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Anexos Essenciais</FormLabel>
                <FormDescription>
                  Marque se a emenda possui todos os anexos essenciais.
                </FormDescription>
              </div>
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
