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
  tipo: z.string().min(1, 'Obrigatório'),
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

const TIPOS_EMENDA = [
  { value: '01', label: '01 - Emenda Federal Bancada' },
  {
    value: '02',
    label:
      '02 - Emenda Federal Individual - Transferências com Finalidade Definida',
  },
  {
    value: '03',
    label: '03 - Emenda Federal Individual - Transferências Especiais',
  },
  { value: '04', label: '04 - Emenda Federal de Comissão' },
  { value: '05', label: '05 - Emenda Estadual Bancada' },
  { value: '06', label: '06 - Emenda Estadual Individual' },
  { value: '07', label: '07 - Emenda Estadual de Comissão' },
  { value: '08', label: '08 - Emenda Parlamentar - Outros' },
  { value: '09', label: '09 - Transferência Voluntária União - Convênio' },
  {
    value: '10',
    label: '10 - Transferência Voluntária União - Contrato de Repasse',
  },
  { value: '11', label: '11 - Transferência Voluntária Estado - Convênio' },
  { value: '12', label: '12 - Fundo a Fundo - Saúde (Custeio)' },
  { value: '13', label: '13 - Fundo a Fundo - Saúde (Investimento)' },
  { value: '14', label: '14 - Fundo a Fundo - Assistência Social' },
  { value: '15', label: '15 - Cessão Onerosa (Pré-Sal)' },
  { value: '16', label: '16 - Royalties (Petróleo/Educação/Saúde)' },
  { value: '17', label: '17 - Operação de Crédito Interna' },
  { value: '18', label: '18 - Operação de Crédito Externa' },
  { value: '19', label: '19 - Alienação de Bens/Ativos' },
  { value: '20', label: '20 - Outras Vinculações Legais' },
  { value: '21', label: '21 - Calamidade Pública / Emergência' },
]

const FUNCOES = [
  { value: '01', label: '01 - Legislativa' },
  { value: '02', label: '02 - Judiciária' },
  { value: '03', label: '03 - Essencial à Justiça' },
  { value: '04', label: '04 - Administração' },
  { value: '05', label: '05 - Defesa Nacional' },
  { value: '06', label: '06 - Segurança Pública' },
  { value: '07', label: '07 - Relações Exteriores' },
  { value: '08', label: '08 - Assistência Social' },
  { value: '09', label: '09 - Previdência Social' },
  { value: '10', label: '10 - Saúde' },
  { value: '11', label: '11 - Trabalho' },
  { value: '12', label: '12 - Educação' },
  { value: '13', label: '13 - Cultura' },
  { value: '14', label: '14 - Direitos da Cidadania' },
  { value: '15', label: '15 - Urbanismo' },
  { value: '16', label: '16 - Habitação' },
  { value: '17', label: '17 - Saneamento' },
  { value: '18', label: '18 - Gestão Ambiental' },
  { value: '19', label: '19 - Ciência e Tecnologia' },
  { value: '20', label: '20 - Agricultura' },
  { value: '21', label: '21 - Organização Agrária' },
  { value: '22', label: '22 - Indústria' },
  { value: '23', label: '23 - Comércio e Serviços' },
  { value: '24', label: '24 - Comunicações' },
  { value: '25', label: '25 - Energia' },
  { value: '26', label: '26 - Transporte' },
  { value: '27', label: '27 - Desporto e Lazer' },
  { value: '28', label: '28 - Encargos Especiais' },
  { value: '29', label: '29 - Serviços' },
  { value: '88', label: '88 - Recursos Vetados' },
  { value: '99', label: '99 - Reserva' },
]

const SUB_FUNCOES = [
  { value: '031 - Ação Legislativa', label: '031 - Ação Legislativa' },
  { value: '032 - Controle Externo', label: '032 - Controle Externo' },
  { value: '061 - Ação Judiciária', label: '061 - Ação Judiciária' },
  {
    value: '062 - Defesa do Interesse Público no Processo Judiciário',
    label: '062 - Defesa do Interesse Público no Processo Judiciário',
  },
  {
    value: '091 - Defesa da Ordem Jurídica',
    label: '091 - Defesa da Ordem Jurídica',
  },
  {
    value: '092 - Representação Judicial e Extrajudicial',
    label: '092 - Representação Judicial e Extrajudicial',
  },
  {
    value: '121 - Planejamento e Orçamento',
    label: '121 - Planejamento e Orçamento',
  },
  { value: '122 - Administração Geral', label: '122 - Administração Geral' },
  {
    value: '123 - Administração Financeira',
    label: '123 - Administração Financeira',
  },
  { value: '124 - Controle Interno', label: '124 - Controle Interno' },
  {
    value: '125 - Normatização e Fiscalização',
    label: '125 - Normatização e Fiscalização',
  },
  {
    value: '126 - Tecnologia da Informação',
    label: '126 - Tecnologia da Informação',
  },
  {
    value: '127 - Ordenamento Territorial',
    label: '127 - Ordenamento Territorial',
  },
  {
    value: '128 - Formação de Recursos Humanos',
    label: '128 - Formação de Recursos Humanos',
  },
  {
    value: '129 - Administração de Receitas',
    label: '129 - Administração de Receitas',
  },
  {
    value: '130 - Administração de Concessões',
    label: '130 - Administração de Concessões',
  },
  { value: '131 - Comunicação Social', label: '131 - Comunicação Social' },
  { value: '151 - Defesa Aérea', label: '151 - Defesa Aérea' },
  { value: '152 - Defesa Naval', label: '152 - Defesa Naval' },
  { value: '153 - Defesa Terrestre', label: '153 - Defesa Terrestre' },
  { value: '181 - Policiamento', label: '181 - Policiamento' },
  { value: '182 - Defesa Civil', label: '182 - Defesa Civil' },
  {
    value: '183 - Informação e Inteligência',
    label: '183 - Informação e Inteligência',
  },
  {
    value: '211 - Custódia e Reintegração Social',
    label: '211 - Custódia e Reintegração Social',
  },
  {
    value: '212 - Direitos Individuais, Coletivos e Difusos',
    label: '212 - Direitos Individuais, Coletivos e Difusos',
  },
  {
    value: '213 - Assistência aos Povos Indígenas',
    label: '213 - Assistência aos Povos Indígenas',
  },
  { value: '241 - Assistência ao Idoso', label: '241 - Assistência ao Idoso' },
  {
    value: '242 - Assistência ao Portador de Deficiência',
    label: '242 - Assistência ao Portador de Deficiência',
  },
  {
    value: '243 - Assistência à Criança e ao Adolescente',
    label: '243 - Assistência à Criança e ao Adolescente',
  },
  {
    value: '244 - Assistência Comunitária',
    label: '244 - Assistência Comunitária',
  },
  {
    value: '271 - Previdência do Regime Estatutário',
    label: '271 - Previdência do Regime Estatutário',
  },
  {
    value: '272 - Previdência do Regime Estratégico',
    label: '272 - Previdência do Regime Estratégico',
  },
  {
    value: '273 - Previdência Complementar',
    label: '273 - Previdência Complementar',
  },
  { value: '274 - Previdência Rural', label: '274 - Previdência Rural' },
  { value: '301 - Atenção Básica', label: '301 - Atenção Básica' },
  {
    value: '302 - Assistência Hospitalar e Ambulatorial',
    label: '302 - Assistência Hospitalar e Ambulatorial',
  },
  {
    value: '303 - Suporte Profilático e Terapêutico',
    label: '303 - Suporte Profilático e Terapêutico',
  },
  { value: '304 - Vigilância Sanitária', label: '304 - Vigilância Sanitária' },
  {
    value: '305 - Vigilância Epidemiológica',
    label: '305 - Vigilância Epidemiológica',
  },
  {
    value: '306 - Alimentação e Nutrição',
    label: '306 - Alimentação e Nutrição',
  },
  {
    value: '331 - Proteção e Benefícios ao Trabalhador',
    label: '331 - Proteção e Benefícios ao Trabalhador',
  },
  { value: '332 - Relações de Trabalho', label: '332 - Relações de Trabalho' },
  { value: '333 - Empregabilidade', label: '333 - Empregabilidade' },
  { value: '334 - Fomento ao Trabalho', label: '334 - Fomento ao Trabalho' },
  { value: '361 - Ensino Fundamental', label: '361 - Ensino Fundamental' },
  { value: '362 - Ensino Médio', label: '362 - Ensino Médio' },
  { value: '363 - Ensino Profissional', label: '363 - Ensino Profissional' },
  { value: '364 - Ensino Superior', label: '364 - Ensino Superior' },
  { value: '365 - Educação Infantil', label: '365 - Educação Infantil' },
  {
    value: '366 - Educação de Jovens e Adultos',
    label: '366 - Educação de Jovens e Adultos',
  },
  { value: '367 - Educação Especial', label: '367 - Educação Especial' },
  { value: '368 - Educação Básica', label: '368 - Educação Básica' },
  {
    value: '391 - Patrimônio Histórico, Artístico e Arqueológico',
    label: '391 - Patrimônio Histórico, Artístico e Arqueológico',
  },
  { value: '392 - Difusão Cultural', label: '392 - Difusão Cultural' },
  {
    value: '421 - Custódia e Reintegração Social (Direitos da Cidadania)',
    label: '421 - Custódia e Reintegração Social (Direitos da Cidadania)',
  },
  {
    value: '422 - Direitos Individuais, Coletivos e Difusos',
    label: '422 - Direitos Individuais, Coletivos e Difusos',
  },
  {
    value: '451 - Infraestrutura Urbana',
    label: '451 - Infraestrutura Urbana',
  },
  { value: '452 - Serviços Urbanos', label: '452 - Serviços Urbanos' },
  {
    value: '453 - Transportes Coletivos Urbanos',
    label: '453 - Transportes Coletivos Urbanos',
  },
  { value: '481 - Habitação Rural', label: '481 - Habitação Rural' },
  { value: '482 - Habitação Urbana', label: '482 - Habitação Urbana' },
  {
    value: '511 - Saneamento Básico Rural',
    label: '511 - Saneamento Básico Rural',
  },
  {
    value: '512 - Saneamento Básico Urbano',
    label: '512 - Saneamento Básico Urbano',
  },
  {
    value: '541 - Preservação e Conservação Ambiental',
    label: '541 - Preservação e Conservação Ambiental',
  },
  { value: '542 - Controle Ambiental', label: '542 - Controle Ambiental' },
  {
    value: '543 - Recuperação de Áreas Degradadas',
    label: '543 - Recuperação de Áreas Degradadas',
  },
  { value: '544 - Recursos Hídricos', label: '544 - Recursos Hídricos' },
  { value: '545 - Meteorologia', label: '545 - Meteorologia' },
  {
    value: '571 - Desenvolvimento Científico',
    label: '571 - Desenvolvimento Científico',
  },
  {
    value: '572 - Desenvolvimento Tecnológico e Engenharia',
    label: '572 - Desenvolvimento Tecnológico e Engenharia',
  },
  {
    value: '573 - Difusão do Conhecimento Científico e Tecnológico',
    label: '573 - Difusão do Conhecimento Científico e Tecnológico',
  },
  {
    value: '601 - Promoção da Produção Vegetal',
    label: '601 - Promoção da Produção Vegetal',
  },
  {
    value: '602 - Promoção da Produção Animal',
    label: '602 - Promoção da Produção Animal',
  },
  { value: '603 - Defesa Agropecuária', label: '603 - Defesa Agropecuária' },
  { value: '604 - Organização Agrária', label: '604 - Organização Agrária' },
  { value: '605 - Abastecimento', label: '605 - Abastecimento' },
  { value: '606 - Extensão Rural', label: '606 - Extensão Rural' },
  { value: '607 - Irrigação', label: '607 - Irrigação' },
  {
    value: '608 - Promoção da Produção Agropecuária',
    label: '608 - Promoção da Produção Agropecuária',
  },
  {
    value: '609 - Defesa Agropecuária (Agropecuária)',
    label: '609 - Defesa Agropecuária (Agropecuária)',
  },
  { value: '631 - Reforma Agrária', label: '631 - Reforma Agrária' },
  { value: '632 - Colonização', label: '632 - Colonização' },
  { value: '661 - Promoção Industrial', label: '661 - Promoção Industrial' },
  { value: '662 - Produção Industrial', label: '662 - Produção Industrial' },
  { value: '663 - Mineração', label: '663 - Mineração' },
  {
    value: '664 - Propriedade Industrial',
    label: '664 - Propriedade Industrial',
  },
  {
    value: '665 - Normalização e Qualidade',
    label: '665 - Normalização e Qualidade',
  },
  { value: '691 - Promoção Comercial', label: '691 - Promoção Comercial' },
  { value: '692 - Comercialização', label: '692 - Comercialização' },
  { value: '693 - Comércio Exterior', label: '693 - Comércio Exterior' },
  { value: '694 - Serviços Financeiros', label: '694 - Serviços Financeiros' },
  { value: '695 - Turismo', label: '695 - Turismo' },
  { value: '721 - Comunicações Postais', label: '721 - Comunicações Postais' },
  { value: '722 - Telecomunicações', label: '722 - Telecomunicações' },
  { value: '751 - Energia Elétrica', label: '751 - Energia Elétrica' },
  { value: '752 - Petróleo', label: '752 - Petróleo' },
  { value: '753 - Biocombustíveis', label: '753 - Biocombustíveis' },
  { value: '781 - Transporte Aéreo', label: '781 - Transporte Aéreo' },
  {
    value: '782 - Transporte Rodoviário',
    label: '782 - Transporte Rodoviário',
  },
  {
    value: '783 - Transporte Ferroviário',
    label: '783 - Transporte Ferroviário',
  },
  {
    value: '784 - Transporte Hidroviário',
    label: '784 - Transporte Hidroviário',
  },
  {
    value: '785 - Transportes Especiais',
    label: '785 - Transportes Especiais',
  },
  {
    value: '811 - Desporto de Rendimento',
    label: '811 - Desporto de Rendimento',
  },
  { value: '812 - Desporto Comunitário', label: '812 - Desporto Comunitário' },
  { value: '813 - Lazer', label: '813 - Lazer' },
  {
    value: '841 - Refinanciamento da Dívida Interna',
    label: '841 - Refinanciamento da Dívida Interna',
  },
  {
    value: '842 - Refinanciamento da Dívida Externa',
    label: '842 - Refinanciamento da Dívida Externa',
  },
  {
    value: '843 - Serviço da Dívida Interna',
    label: '843 - Serviço da Dívida Interna',
  },
  {
    value: '844 - Serviço da Dívida Externa',
    label: '844 - Serviço da Dívida Externa',
  },
  {
    value: '845 - Outras Transferências',
    label: '845 - Outras Transferências',
  },
  {
    value: '846 - Outros Encargos Especiais',
    label: '846 - Outros Encargos Especiais',
  },
  {
    value: '847 - Transferências para a Educação Básica',
    label: '847 - Transferências para a Educação Básica',
  },
  {
    value: '999 - Reserva de Contingência',
    label: '999 - Reserva de Contingência',
  },
]

const CATEGORIAS = [
  { value: '01 - Custeio', label: '01 - Custeio' },
  { value: '02 - Investimento', label: '02 - Investimento' },
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
  {
    value: '2064',
    label: '2064 - GESTÃO DA ATENÇÃO PRIMÁRIA EM SAÚDE',
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
      render={({ field }) => {
        // Find option with exact match or starting with "code -" to support legacy data gracefully
        const selectedOption = options.find(
          (option) =>
            option.value === field.value ||
            (field.value && option.value.startsWith(`${field.value} -`)),
        )

        return (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      'w-full justify-between font-normal h-auto min-h-[2.5rem] py-2',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    <span className="truncate text-left whitespace-normal leading-tight">
                      {selectedOption
                        ? selectedOption.label
                        : field.value || placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder={`Buscar ${label.toLowerCase()}...`}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum resultado.</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => {
                        const isSelected =
                          field.value === option.value ||
                          (field.value &&
                            option.value.startsWith(`${field.value} -`))
                        return (
                          <CommandItem
                            value={option.label}
                            key={option.value}
                            onSelect={() => {
                              form.setValue(name, option.value, {
                                shouldValidate: true,
                              })
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4 shrink-0',
                                isSelected ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            <span className="whitespace-normal leading-tight">
                              {option.label}
                            </span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
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
      tipo: '',
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
      case '2064':
        form.setValue('orgao', '03 - SECRETARIA MUNICIPAL DE SAÚDE - SMS')
        form.setValue('unidade_orcamentaria', '0302 - FUNDO MUNICIPAL DE SAÚDE')
        form.setValue('funcao', '10')
        form.setValue('sub_funcao', '301 - Atenção Básica')
        form.setValue('programa', '0007 - LAGARTO SAÚDE INTEGRAL E ACESSÍVEL')
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
      const payload: any = {
        identificador: data.identificador,
        ano: data.ano,
        data_referencia: data.data_referencia,
        numero_emenda: data.numero_emenda,
        tipo: data.tipo,
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
      }

      const { error } = await supabase.from('pre_lancamentos').insert(payload)
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
                    Identificação da Emenda
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
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
                      <FormItem>
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
                      <FormItem>
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
                      <FormItem>
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
                      <FormItem>
                        <FormLabel>Número da Emenda</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 2025..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ComboboxField
                    form={form}
                    name="tipo"
                    label="Tipo"
                    options={TIPOS_EMENDA}
                    placeholder="Selecione o tipo"
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
                  <FormField
                    control={form.control}
                    name="orgao"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          Órgão
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Órgão"
                            className="font-medium text-sm text-brand-900 dark:text-brand-100 bg-white dark:bg-neutral-900 border-brand-200/60 dark:border-brand-800 focus-visible:ring-brand-500"
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
                    name="unidade_orcamentaria"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          Unidade Orçamentária
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Unidade Orçamentária"
                            className="font-medium text-sm text-brand-900 dark:text-brand-100 bg-white dark:bg-neutral-900 border-brand-200/60 dark:border-brand-800 focus-visible:ring-brand-500"
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
                    name="programa"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          Programa
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Programa"
                            className="font-medium text-sm text-brand-900 dark:text-brand-100 bg-white dark:bg-neutral-900 border-brand-200/60 dark:border-brand-800 focus-visible:ring-brand-500"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
