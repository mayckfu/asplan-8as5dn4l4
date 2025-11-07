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
  demanda?: string
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
  natureza?: string
  objeto_emenda?: string
  meta_operacional?: string
  destino_recurso?: string
  data_repasse?: string
  valor_repasse?: number
  situacao_recurso?: string
  observacoes?: string
}

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
  ...Array.from({ length: 15 }, (_, i) => {
    const tipoRecursoKeys = Object.keys(
      TipoRecurso,
    ) as (keyof typeof TipoRecurso)[]
    const situacaoKeys = Object.keys(
      SituacaoOficial,
    ) as (keyof typeof SituacaoOficial)[]
    const statusKeys = Object.keys(
      StatusInterno,
    ) as (keyof typeof StatusInterno)[]
    return {
      id: `${i + 6}`,
      tipo: i % 2 === 0 ? 'Individual' : 'Bancada',
      tipo_recurso: tipoRecursoKeys[i % tipoRecursoKeys.length],
      autor: ['Dep. Fulano de Tal', 'Sen. Ciclano', 'Dep. Beltrano'][i % 3],
      numero_emenda: `202499${i}${i}`,
      numero_proposta: `PROPOSTA${100 + i}`,
      valor_total: 100000 + i * 15000,
      situacao: situacaoKeys[i % situacaoKeys.length],
      status_interno: statusKeys[i % statusKeys.length],
      portaria: i % 2 === 0 ? `PORTARIA-${100 + i}` : null,
      deliberacao_cie: i % 3 === 0 ? `CIE-${200 + i}` : null,
      created_at: `2023-06-${10 + i}`,
      total_repassado: 80000 + i * 10000,
      total_gasto: 70000 + i * 8000,
      anexos_essenciais: i % 2 === 0,
    }
  }),
]

const detailedAmendmentsData: Record<
  string,
  Omit<DetailedAmendment, keyof Amendment>
> = {
  '1': {
    descricao_completa:
      'Aquisição de equipamentos para o hospital municipal, visando melhorar o atendimento na ala de emergência. O objetivo é reduzir o tempo de espera e aumentar a capacidade de diagnóstico, beneficiando diretamente a população local com um serviço de saúde mais eficiente e moderno.',
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
        autorizada_por: 'Carlos Lima',
        responsavel_execucao: 'Ana Costa',
        unidade_destino: 'Hospital Municipal',
        fornecedor_nome: 'MedEquip S.A.',
        status_execucao: 'PAGA',
        demanda: 'Equipamentos de Emergência',
      },
      {
        id: 'D1-2',
        data: '2023-02-20',
        valor: 25000,
        categoria: 'Insumos',
        descricao: 'Compra de materiais de consumo',
        registrada_por: 'Ana Costa',
        autorizada_por: 'Carlos Lima',
        responsavel_execucao: 'Ana Costa',
        unidade_destino: 'Hospital Municipal',
        fornecedor_nome: 'Insumos Brasil',
        status_execucao: 'PAGA',
        demanda: 'Insumos Hospitalares',
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
    natureza: 'Outros Serviços Terceiros',
    objeto_emenda:
      'PMAE – componente cirúrgico (PNRF / Mutirão) – Otorrinolaringologia',
    meta_operacional:
      'Ofertar cirurgias de adenoidectomia, amigdalectomia e septoplastia para média de 600 pacientes; fornecer aparelhos auditivos.',
    destino_recurso:
      'Secretaria Municipal de Saúde de Lagarto — Diretoria de Atenção Especializada',
    data_repasse: '2025-07-17',
    valor_repasse: 150000,
    situacao_recurso: 'Paga',
    observacoes:
      'Repasse executado conforme cronograma PMAE; aguardando relatório de execução.',
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
        registrada_por: 'Carlos Lima',
        autorizada_por: undefined,
        responsavel_execucao: 'Carlos Lima',
        unidade_destino: 'Hospital Regional',
        fornecedor_nome: 'Construtora Principal',
        status_execucao: 'LIQUIDADA',
        demanda: 'Obras de Expansão',
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
    pendencias: [],
    valor_repasse: 250000,
    objeto_emenda: '',
    meta_operacional:
      'Aumentar em 20 leitos a capacidade de internação infantil.',
  },
  '4': {
    descricao_completa:
      'Compra de ambulância para o município de Pequenópolis.',
    repasses: [
      {
        id: 'R4-1',
        data: '2024-04-15',
        valor: 100000,
        fonte: 'Fundo Municipal de Saúde',
      },
    ],
    despesas: [
      {
        id: 'D4-1',
        data: '2024-04-20',
        valor: 110000,
        categoria: 'Veículos',
        descricao: 'Pagamento da ambulância',
        registrada_por: 'Admin',
        autorizada_por: 'Carlos Lima',
        responsavel_execucao: 'Admin',
        unidade_destino: 'Secretaria de Saúde',
        fornecedor_nome: 'Veículos Especiais Ltda.',
        status_execucao: 'PAGA',
        demanda: 'Renovação de Frota',
      },
    ],
    anexos: [],
    historico: [],
    pendencias: [],
    valor_repasse: 100000,
    objeto_emenda: 'Aquisição de ambulância tipo A',
    meta_operacional: '',
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
    pendencias: [],
    objeto_emenda:
      id === '3' ? '' : 'Objeto de teste para emenda sem detalhes.',
    meta_operacional:
      id === '5' ? '' : 'Meta de teste para emenda sem detalhes.',
    valor_repasse: baseAmendment.total_repassado,
  }

  const fullAmendmentData = {
    ...baseAmendment,
    ...details,
  }

  const pendencias: Pendencia[] = []
  if (!fullAmendmentData.portaria) {
    pendencias.push({
      id: `p-${id}-portaria`,
      descricao: 'Falta Portaria',
      dispensada: false,
    })
  }
  if (!fullAmendmentData.deliberacao_cie) {
    pendencias.push({
      id: `p-${id}-cie`,
      descricao: 'Falta Deliberação CIE',
      dispensada: false,
    })
  }
  if (!fullAmendmentData.objeto_emenda) {
    pendencias.push({
      id: `p-${id}-objeto`,
      descricao: 'Falta Objeto',
      dispensada: false,
    })
  }
  if (!fullAmendmentData.meta_operacional) {
    pendencias.push({
      id: `p-${id}-meta`,
      descricao: 'Falta Meta Operacional',
      dispensada: false,
    })
  }
  if (fullAmendmentData.total_gasto > fullAmendmentData.total_repassado) {
    pendencias.push({
      id: `p-${id}-despesas`,
      descricao: 'Despesas > Repasses',
      dispensada: false,
    })
  }

  fullAmendmentData.pendencias = pendencias

  return fullAmendmentData
}
