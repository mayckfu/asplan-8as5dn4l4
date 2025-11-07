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

export type Repasse = {
  id: string
  data: string
  valor: number
  fonte: string
  comprovante_url?: string
}

export type Despesa = {
  id: string
  data: string
  valor: number
  categoria: string
  descricao: string
  nota_fiscal_url?: string
  registrada_por: string
  autorizada_por?: string
  responsavel_execucao?: string
  unidade_destino: string
  fornecedor_nome: string
  status_execucao: 'PLANEJADA' | 'EMPENHADA' | 'LIQUIDADA' | 'PAGA'
}

export type Anexo = {
  id: string
  tipo:
    | 'PORTARIA'
    | 'DELIBERACAO_CIE'
    | 'COMPROVANTE_FNS'
    | 'NOTA_FISCAL'
    | 'OUTRO'
  titulo: string
  url: string
  created_at: string
  uploader: string
}

export type Historico = {
  id: string
  emenda_id: string
  evento: string
  detalhe: string
  feito_por: string
  criado_em: string
}

export type Pendencia = {
  id: string
  descricao: string
  dispensada: boolean
  justificativa?: string
}

export type DetailedAmendment = Amendment & {
  descricao_completa: string
  repasses: Repasse[]
  despesas: Despesa[]
  anexos: Anexo[]
  historico: Historico[]
  pendencias: Pendencia[]
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

const getPendenciasFromAmendment = (amendment: Amendment): string[] => {
  const pendencias: string[] = []
  if (!amendment.portaria) pendencias.push('Falta Portaria')
  if (!amendment.deliberacao_cie) pendencias.push('Falta CIE')
  if (!amendment.anexos_essenciais) pendencias.push('Sem Anexos Essenciais')
  if (amendment.total_repassado <= 0) pendencias.push('Sem Repasses')
  if (amendment.total_gasto > amendment.total_repassado)
    pendencias.push('Despesas > Repasses')
  return pendencias
}

const detailedAmendmentsData: Record<
  string,
  Omit<DetailedAmendment, keyof Amendment>
> = {
  '1': {
    descricao_completa:
      'Aquisição de equipamentos para o hospital municipal, visando melhorar o atendimento na ala de emergência.',
    repasses: [
      {
        id: 'R1-1',
        data: '2023-02-01',
        valor: 150000,
        fonte: 'Fundo Nacional de Saúde',
      },
    ],
    despesas: [
      {
        id: 'D1-1',
        data: '2023-02-15',
        valor: 120000,
        categoria: 'Equipamentos Médicos',
        descricao: 'Compra de 2 monitores cardíacos',
        registrada_por: 'Admin',
        responsavel_execucao: 'Ana Costa',
        unidade_destino: 'Hospital Municipal',
        fornecedor_nome: 'MedEquip S.A.',
        status_execucao: 'PAGA',
      },
      {
        id: 'D1-2',
        data: '2023-02-20',
        valor: 25000,
        categoria: 'Insumos',
        descricao: 'Compra de materiais de consumo',
        registrada_por: 'Admin',
        responsavel_execucao: 'Ana Costa',
        unidade_destino: 'Hospital Municipal',
        fornecedor_nome: 'Insumos Brasil',
        status_execucao: 'PAGA',
      },
    ],
    anexos: [
      {
        id: 'A1-1',
        tipo: 'PORTARIA',
        titulo: 'Portaria de Liberação',
        url: '#',
        created_at: '2023-01-15',
        uploader: 'Admin',
      },
      {
        id: 'A1-2',
        tipo: 'DELIBERACAO_CIE',
        titulo: 'Aprovação CIE',
        url: '#',
        created_at: '2023-01-20',
        uploader: 'Admin',
      },
      {
        id: 'A1-3',
        tipo: 'NOTA_FISCAL',
        titulo: 'NF Monitores',
        url: '#',
        created_at: '2023-02-16',
        uploader: 'Ana Costa',
      },
    ],
    historico: [
      {
        id: 'H1-1',
        emenda_id: '1',
        evento: 'CREATED',
        detalhe: 'Emenda criada',
        feito_por: 'Admin',
        criado_em: '2023-01-15 10:00',
      },
      {
        id: 'H1-2',
        emenda_id: '1',
        evento: 'STATUS_CHANGE',
        detalhe: 'Status alterado para PAGA',
        feito_por: 'Sistema',
        criado_em: '2023-02-01 12:00',
      },
    ],
    pendencias: [],
  },
  '2': {
    descricao_completa:
      'Construção de nova ala de pediatria no hospital regional.',
    repasses: [
      {
        id: 'R2-1',
        data: '2023-04-01',
        valor: 250000,
        fonte: 'Fundo Nacional de Saúde',
      },
    ],
    despesas: [
      {
        id: 'D2-1',
        data: '2023-04-10',
        valor: 100000,
        categoria: 'Obras',
        descricao: 'Serviços de fundação',
        registrada_por: 'Admin',
        responsavel_execucao: 'Carlos Lima',
        unidade_destino: 'Hospital Regional',
        fornecedor_nome: 'Construtora Principal',
        status_execucao: 'LIQUIDADA',
      },
    ],
    anexos: [
      {
        id: 'A2-1',
        tipo: 'DELIBERACAO_CIE',
        titulo: 'Aprovação CIE',
        url: '#',
        created_at: '2023-03-25',
        uploader: 'Admin',
      },
    ],
    historico: [
      {
        id: 'H2-1',
        emenda_id: '2',
        evento: 'CREATED',
        detalhe: 'Emenda criada',
        feito_por: 'Admin',
        criado_em: '2023-03-20 09:00',
      },
    ],
    pendencias: [
      { id: 'P2-1', descricao: 'Falta Portaria', dispensada: false },
      {
        id: 'P2-2',
        descricao: 'Sem Anexos Essenciais',
        dispensada: true,
        justificativa: 'Anexos serão adicionados após a obra.',
      },
    ],
  },
}

export const getAmendmentDetails = (
  id: string,
): DetailedAmendment | undefined => {
  const baseAmendment = amendments.find((a) => a.id === id)
  if (!baseAmendment) return undefined

  const details = detailedAmendmentsData[id] || {
    descricao_completa: 'Descrição não disponível.',
    repasses: [],
    despesas: [],
    anexos: [],
    historico: [],
    pendencias: getPendenciasFromAmendment(baseAmendment).map((p, i) => ({
      id: `P${id}-${i}`,
      descricao: p,
      dispensada: false,
    })),
  }

  return {
    ...baseAmendment,
    ...details,
  }
}

// This is a copy of the old amendmentDetails to avoid breaking other pages that might use it.
// It should be deprecated and removed in the future.
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
