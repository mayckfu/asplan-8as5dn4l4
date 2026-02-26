import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  FileIcon,
  Trash2,
  Save,
  Landmark,
  ClipboardList,
  ChevronsUpDown,
  Check,
  Loader2,
  FilePlus,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUpload } from '@/components/FileUpload'
import { formatBytes, cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { MoneyInput } from '@/components/ui/money-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

const preLancamentoSchema = z.object({
  identificador: z.string().optional(),
  ano: z.coerce.number().min(2000),
  data_referencia: z.string(),
  numero_emenda: z.string().min(1, 'Obrigatório'),
  modalidade_aplicacao: z.string().min(1, 'Obrigatório'),
  parlamentar: z.string().min(1, 'Obrigatório'),
  beneficiario: z.string().optional(),
  localidade: z.string().optional(),
  valor_previsto: z.coerce.number().min(0),
  objeto: z.string().optional(),
  funcao: z.string().optional(),
  sub_funcao: z.string().optional(),
  categoria_economica: z.string().optional(),
  acao_orcamentaria: z.string().optional(),
  orgao: z.string().optional(),
  unidade_orcamentaria: z.string().optional(),
  programa: z.string().optional(),
})

type PreLancamentoFormValues = z.infer<typeof preLancamentoSchema>

const FUNCOES = [
  { value: '10', label: '10 - Saúde' },
  { value: '08', label: '08 - Assistência Social' },
  { value: '12', label: '12 - Educação' },
]

const SUB_FUNCOES = [
  { value: '301', label: '301 - Atenção Básica' },
  { value: '302', label: '302 - Assistência Hospitalar e Ambulatorial' },
  { value: '303', label: '303 - Suporte Profilático e Terapêutico' },
  { value: '304', label: '304 - Vigilância Sanitária' },
  { value: '305', label: '305 - Vigilância Epidemiológica' },
]

const CATEGORIAS = [
  { value: '3', label: '3 - Despesas Correntes' },
  { value: '4', label: '4 - Despesas de Capital' },
]

const ACOES = [
  {
    value: '8581',
    label: '8581 - Estruturação da Rede de Serviços de Atenção Básica',
  },
  {
    value: '2E89',
    label: '2E89 - Incremento Temporário ao Custeio',
  },
  {
    value: '8535',
    label: '8535 - Estruturação de Unidades de Atenção',
  },
  {
    value: '2E90',
    label: '2E90 - Incremento Temporário Assistência Hospitalar',
  },
]

const ComboboxField = ({
  form,
  name,
  label,
  options,
  placeholder,
}: {
  form: any
  name: string
  label: string
  options: any[]
  placeholder: string
}) => {
  const [open, setOpen] = useState(false)
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value
                    ? options.find((option) => option.value === field.value)
                        ?.label
                    : placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder={`Buscar ${label.toLowerCase()}...`}
                />
                <CommandList>
                  <CommandEmpty>Nenhum resultado.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          form.setValue(name, option.value)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            option.value === field.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

const PreLancamentoPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const form = useForm<PreLancamentoFormValues>({
    resolver: zodResolver(preLancamentoSchema),
    defaultValues: {
      identificador: '',
      ano: 2025,
      data_referencia: format(new Date(), 'yyyy-MM-dd'),
      numero_emenda: '',
      modalidade_aplicacao: 'DIRETA',
      parlamentar: '',
      beneficiario: '',
      localidade: '',
      valor_previsto: 0,
      objeto: '',
      funcao: '',
      sub_funcao: '',
      categoria_economica: '',
      acao_orcamentaria: '',
      orgao: '',
      unidade_orcamentaria: '',
      programa: '',
    },
  })

  const acao = form.watch('acao_orcamentaria')

  useEffect(() => {
    switch (acao) {
      case '8581':
      case '2E89':
        form.setValue('orgao', '36000 - Ministério da Saúde')
        form.setValue('unidade_orcamentaria', '36901 - Fundo Nacional de Saúde')
        form.setValue('programa', '5018 - Atenção Primária à Saúde')
        break
      case '8535':
      case '2E90':
        form.setValue('orgao', '36000 - Ministério da Saúde')
        form.setValue('unidade_orcamentaria', '36901 - Fundo Nacional de Saúde')
        form.setValue('programa', '5019 - Assistência Especializada à Saúde')
        break
      default:
        if (!acao) {
          form.setValue('orgao', '')
          form.setValue('unidade_orcamentaria', '')
          form.setValue('programa', '')
        }
    }
  }, [acao, form])

  const handleFilesAccepted = (accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PreLancamentoFormValues) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('pre_lancamentos').insert({
        identificador: data.identificador,
        ano: data.ano,
        data_referencia: data.data_referencia,
        numero_emenda: data.numero_emenda,
        modalidade_aplicacao: data.modalidade_aplicacao,
        parlamentar: data.parlamentar,
        beneficiario: data.beneficiario,
        localidade: data.localidade,
        valor_previsto: data.valor_previsto,
        objeto: data.objeto,
        funcao: data.funcao,
        sub_funcao: data.sub_funcao,
        categoria_economica: data.categoria_economica,
        acao_orcamentaria: data.acao_orcamentaria,
        orgao: data.orgao,
        unidade_orcamentaria: data.unidade_orcamentaria,
        programa: data.programa,
        created_by: user.id,
      })
      if (error) throw error

      toast({
        title: 'Pré-lançamento salvo com sucesso!',
        description: 'Os dados foram registrados.',
      })
      form.reset()
      setFiles([])
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
          <FilePlus className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Pré-Lançamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize e preencha os dados da emenda antes do lançamento oficial.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col relative"
        >
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Form Blocks */}
            <div className="flex-1 space-y-6">
              <Card className="shadow-sm border-neutral-200">
                <CardHeader className="bg-muted/40 border-b border-border py-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                      1
                    </span>
                    Identificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2 lg:col-span-1">
                    <Label className="text-muted-foreground font-semibold">
                      Código
                    </Label>
                    <Input
                      value="Automático"
                      disabled
                      className="bg-muted/50 font-mono text-center"
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="identificador"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-1">
                        <FormLabel>Identificador</FormLabel>
                        <FormControl>
                          <Input placeholder="Opcional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ano"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-1">
                        <FormLabel>Ano</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="data_referencia"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-1">
                        <FormLabel>Data Referência</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numero_emenda"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-1">
                        <FormLabel>Número da Emenda</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 2025..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-neutral-200">
                <CardHeader className="bg-muted/40 border-b border-border py-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                      2
                    </span>
                    Detalhes e Classificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="modalidade_aplicacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modalidade Aplicação</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DIRETA">Direta</SelectItem>
                            <SelectItem value="INDIRETA">Indireta</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input placeholder="Nome do autor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valor_previsto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Previsto (R$)</FormLabel>
                        <FormControl>
                          <MoneyInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="0,00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="beneficiario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beneficiário</FormLabel>
                        <FormControl>
                          <Input placeholder="Entidade ou pessoa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="localidade"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Localidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade / Estado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="objeto"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2 lg:col-span-3">
                        <FormLabel>Objeto da Emenda</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a finalidade..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-neutral-200">
                <CardHeader className="bg-muted/40 border-b border-border py-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                      3
                    </span>
                    Estrutura Orçamentária
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ComboboxField
                    form={form}
                    name="funcao"
                    label="Função"
                    options={FUNCOES}
                    placeholder="Selecione a função"
                  />
                  <ComboboxField
                    form={form}
                    name="sub_funcao"
                    label="Sub-Função"
                    options={SUB_FUNCOES}
                    placeholder="Selecione a sub-função"
                  />
                  <ComboboxField
                    form={form}
                    name="categoria_economica"
                    label="Categoria Econômica"
                    options={CATEGORIAS}
                    placeholder="Selecione a categoria"
                  />
                  <ComboboxField
                    form={form}
                    name="acao_orcamentaria"
                    label="Ação Orçamentária"
                    options={ACOES}
                    placeholder="Selecione a ação"
                  />
                </CardContent>
              </Card>

              <Card className="bg-brand-50 border-brand-100 dark:bg-brand-950/20 dark:border-brand-900 shadow-sm overflow-hidden">
                <CardHeader className="py-3 border-b border-brand-100/50 dark:border-brand-900/50 bg-brand-100/30 dark:bg-brand-900/30">
                  <CardTitle className="text-sm font-semibold text-brand-800 dark:text-brand-300 flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    Resumo da Classificação Institucional e Programática
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Órgão
                    </Label>
                    <div className="font-medium text-sm text-brand-900 dark:text-brand-100 bg-white dark:bg-neutral-900 px-3 py-2.5 rounded-md border border-brand-200/60 dark:border-brand-800 shadow-sm">
                      {form.watch('orgao') || '—'}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Unidade Orçamentária
                    </Label>
                    <div className="font-medium text-sm text-brand-900 dark:text-brand-100 bg-white dark:bg-neutral-900 px-3 py-2.5 rounded-md border border-brand-200/60 dark:border-brand-800 shadow-sm">
                      {form.watch('unidade_orcamentaria') || '—'}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Programa
                    </Label>
                    <div className="font-medium text-sm text-brand-900 dark:text-brand-100 bg-white dark:bg-neutral-900 px-3 py-2.5 rounded-md border border-brand-200/60 dark:border-brand-800 shadow-sm">
                      {form.watch('programa') || '—'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attachments Sidebar */}
            <div className="w-full lg:w-80 space-y-6">
              <Card className="sticky top-6 shadow-sm border-neutral-200">
                <CardHeader className="bg-muted/40 border-b border-border py-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> Anexos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <FileUpload
                    onFilesAccepted={handleFilesAccepted}
                    className="border-dashed bg-muted/20 hover:bg-muted/40"
                  />
                  {files.length > 0 && (
                    <div className="space-y-2 mt-4 animate-in fade-in">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Arquivos Adicionados
                      </h4>
                      {files.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between p-2.5 rounded-md border bg-neutral-50 dark:bg-neutral-900 shadow-sm group transition-colors hover:border-primary/30"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-1.5 bg-white dark:bg-neutral-800 rounded border shrink-0">
                              <FileIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span
                                className="text-sm font-medium truncate text-neutral-800 dark:text-neutral-200"
                                title={file.name}
                              >
                                {file.name}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {formatBytes(file.size)}
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 opacity-50 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Fixed Action Footer */}
          <div className="sticky bottom-4 z-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] w-full gap-4 backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95">
            <div className="font-mono text-sm font-bold tracking-wider text-muted-foreground flex items-center gap-2.5 bg-muted/50 px-3 py-1.5 rounded-md border">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse ring-4 ring-blue-500/20" />
              MODO: INCLUIR
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  form.reset()
                  setFiles([])
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 bg-brand-600 hover:bg-brand-700 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Gravar Emenda
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default PreLancamentoPage
