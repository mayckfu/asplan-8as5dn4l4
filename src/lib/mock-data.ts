export const TipoRecurso = {
  CUSTEIO_MAC: 'Custeio MAC',
  CUSTEIO_PAP: 'Custeio PAP',
  EQUIPAMENTO: 'Equipamento',
  INCREMENTO_MAC: 'Incremento MAC',
  INCREMENTO_PAP: 'Incremento PAP',
  OUTRO: 'Outro',
} as const

export const SituacaoOficial = {
  PAGA: 'Paga',
  EMPENHADA_AGUARDANDO_FORMALIZACAO: 'Empenhada (Aguardando Formalização)',
  FAVORAVEL: 'Favorável',
  EM_ANALISE: 'Em Análise',
  LIBERADO_PAGAMENTO_FNS: 'Liberado Pagamento FNS',
  OUTRA: 'Outra',
} as const

export const StatusInterno = {
  RASCUNHO: 'Rascunho',
  EM_EXECUCAO: 'Em Execução',
  PAGA_SEM_DOCUMENTOS: 'Paga (Sem Documentos)',
  PAGA_COM_PENDENCIAS: 'Paga (Com Pendências)',
  CONCLUIDA: 'Concluída',
} as const

export type TipoRecursoEnum = keyof typeof TipoRecurso
export type SituacaoOficialEnum = keyof typeof SituacaoOficial
export type StatusInternoEnum = keyof typeof StatusInterno

export type Amendment = {
  id: string
  tipo: string
  tipo_recurso: TipoRecursoEnum
  autor: string
  numero_emenda: string
  numero_proposta: string
  valor_total: number
  situacao: SituacaoOficialEnum
  status_interno: StatusInternoEnum
  portaria: string | null
  deliberacao_cie: string | null
  created_at: string
  total_repassado: number
  total_gasto: number
  anexos_essenciais: boolean
}

export const kpiData = [
  { title: 'Total de Emendas Ativas', value: '78', icon: 'list' },
  { title: 'Emendas em Análise', value: '12', icon: 'search' },
  { title: 'Repasses Pendentes', value: 'R$ 1.2M', icon: 'dollar-sign' },
  { title: 'Despesas Aprovadas', value: 'R$ 4.5M', icon: 'check-circle' },
]

export const amendments: Amendment[] = [
  {
    id: '1',
    tipo: 'Individual',
    tipo_recurso: 'CUSTEIO_MAC',
    autor: 'Dep. João da Silva',
    numero_emenda: '20231234-1',
    numero_proposta: 'PROPOSTA001',
    valor_total: 150000,
    situacao: 'PAGA',
    status_interno: 'CONCLUIDA',
    portaria: 'PORTARIA-123',
    deliberacao_cie: 'CIE-456',
    created_at: '2023-01-15',
    total_repassado: 150000,
    total_gasto: 145000,
    anexos_essenciais: true,
  },
  {
    id: '2',
    tipo: 'Bancada',
    tipo_recurso: 'EQUIPAMENTO',
    autor: 'Dep. Maria Oliveira',
    numero_emenda: '20235678-2',
    numero_proposta: 'PROPOSTA002',
    valor_total: 500000,
    situacao: 'EM_ANALISE',
    status_interno: 'EM_EXECUCAO',
    portaria: null,
    deliberacao_cie: 'CIE-789',
    created_at: '2023-03-20',
    total_repassado: 250000,
    total_gasto: 100000,
    anexos_essenciais: false,
  },
  {
    id: '3',
    tipo: 'Comissão',
    tipo_recurso: 'INCREMENTO_PAP',
    autor: 'Sen. Carlos Santos',
    numero_emenda: '20241122-3',
    numero_proposta: 'PROPOSTA003',
    valor_total: 300000,
    situacao: 'FAVORAVEL',
    status_interno: 'RASCUNHO',
    portaria: 'PORTARIA-321',
    deliberacao_cie: null,
    created_at: '2024-02-10',
    total_repassado: 0,
    total_gasto: 0,
    anexos_essenciais: true,
  },
  {
    id: '4',
    tipo: 'Individual',
    tipo_recurso: 'CUSTEIO_PAP',
    autor: 'Dep. Ana Pereira',
    numero_emenda: '20243344-4',
    numero_proposta: 'PROPOSTA004',
    valor_total: 200000,
    situacao: 'EMPENHADA_AGUARDANDO_FORMALIZACAO',
    status_interno: 'PAGA_COM_PENDENCIAS',
    portaria: 'PORTARIA-444',
    deliberacao_cie: 'CIE-555',
    created_at: '2024-04-01',
    total_repassado: 100000,
    total_gasto: 110000,
    anexos_essenciais: true,
  },
  {
    id: '5',
    tipo: 'Bancada',
    tipo_recurso: 'OUTRO',
    autor: 'Dep. João da Silva',
    numero_emenda: '20245566-5',
    numero_proposta: 'PROPOSTA005',
    valor_total: 750000,
    situacao: 'LIBERADO_PAGAMENTO_FNS',
    status_interno: 'PAGA_SEM_DOCUMENTOS',
    portaria: null,
    deliberacao_cie: null,
    created_at: '2024-05-05',
    total_repassado: 750000,
    total_gasto: 750000,
    anexos_essenciais: false,
  },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `${i + 6}`,
    tipo: i % 2 === 0 ? 'Individual' : 'Bancada',
    tipo_recurso: 'CUSTEIO_MAC' as TipoRecursoEnum,
    autor: 'Dep. Fulano de Tal',
    numero_emenda: `202499${i}${i}`,
    numero_proposta: `PROPOSTA${100 + i}`,
    valor_total: 100000 + i * 5000,
    situacao: 'PAGA' as SituacaoOficialEnum,
    status_interno: 'CONCLUIDA' as StatusInternoEnum,
    portaria: `PORTARIA-${100 + i}`,
    deliberacao_cie: `CIE-${200 + i}`,
    created_at: `2023-06-${10 + i}`,
    total_repassado: 100000 + i * 5000,
    total_gasto: 90000 + i * 5000,
    anexos_essenciais: true,
  })),
]

export const amendmentDetails = {
  id: 'EM12345',
  title: 'Projeto de Infraestrutura Urbana',
  officialStatus: 'Aprovado',
  internalStatus: 'Concluído',
  responsible: 'Ana Silva',
  creationDate: '2023-01-15',
  totalValue: 500000,
  description:
    'Melhoria da pavimentação e iluminação pública no bairro central.',
  origin: 'Emenda Parlamentar Federal',
  type: 'Investimento',
  observations: 'Projeto concluído com sucesso dentro do prazo.',
  lastUpdate: '2023-12-20',
  transfers: [
    {
      id: 'REP001',
      date: '2023-02-20',
      value: 250000,
      status: 'Realizado',
      origin: 'Tesouro Nacional',
      destination: 'Prefeitura Municipal',
      observations: 'Primeira parcela',
    },
    {
      id: 'REP002',
      date: '2023-06-15',
      value: 250000,
      status: 'Realizado',
      origin: 'Tesouro Nacional',
      destination: 'Prefeitura Municipal',
      observations: 'Segunda parcela',
    },
  ],
  expenses: [
    {
      id: 'DESP01',
      description: 'Contratação de Construtora',
      date: '2023-03-10',
      value: 400000,
      status: 'Aprovada',
      category: 'Obras',
      provider: 'Construtora Alfa Ltda.',
    },
    {
      id: 'DESP02',
      description: 'Compra de Postes de LED',
      date: '2023-04-05',
      value: 85000,
      status: 'Aprovada',
      category: 'Materiais',
      provider: 'Ilumina Brasil S.A.',
    },
  ],
  attachments: [
    {
      name: 'projeto_base.pdf',
      uploadDate: '2023-01-15',
      uploader: 'Ana Silva',
      type: 'pdf',
    },
    {
      name: 'orcamento_detalhado.xlsx',
      uploadDate: '2023-01-20',
      uploader: 'Ana Silva',
      type: 'excel',
    },
    {
      name: 'nota_fiscal_01.pdf',
      uploadDate: '2023-03-12',
      uploader: 'Financeiro',
      type: 'pdf',
    },
  ],
  checklist: [
    { id: 1, description: 'Aprovação do projeto base', completed: true },
    { id: 2, description: 'Licitação da obra', completed: true },
    { id: 3, description: 'Recebimento da primeira parcela', completed: true },
    { id: 4, description: 'Execução da pavimentação', completed: true },
    { id: 5, description: 'Prestação de contas final', completed: false },
  ],
  history: [
    {
      timestamp: '2023-01-15 10:00',
      user: 'Ana Silva',
      action: 'Emenda criada',
      details: 'Status inicial: Rascunho',
    },
    {
      timestamp: '2023-01-25 14:30',
      user: 'Admin',
      action: 'Status Oficial alterado',
      details: "De 'Pendente' para 'Aprovado'",
    },
    {
      timestamp: '2023-03-10 11:00',
      user: 'Financeiro',
      action: 'Despesa adicionada',
      details: 'ID DESP01 - R$ 400.000,00',
    },
    {
      timestamp: '2023-12-20 18:00',
      user: 'Ana Silva',
      action: 'Status Interno alterado',
      details: "De 'Aguardando Repasse' para 'Concluído'",
    },
  ],
}
