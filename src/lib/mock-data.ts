export type Amendment = {
  id: string
  title: string
  officialStatus: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Em Análise'
  internalStatus: 'Rascunho' | 'Em Revisão' | 'Aguardando Repasse' | 'Concluído'
  responsible: string
  creationDate: string
  totalValue: number
  description: string
  origin: string
  type: string
  observations: string
  lastUpdate: string
}

export const kpiData = [
  { title: 'Total de Emendas Ativas', value: '78', icon: 'list' },
  { title: 'Emendas em Análise', value: '12', icon: 'search' },
  { title: 'Repasses Pendentes', value: 'R$ 1.2M', icon: 'dollar-sign' },
  { title: 'Despesas Aprovadas', value: 'R$ 4.5M', icon: 'check-circle' },
]

export const amendments: Amendment[] = [
  {
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
  },
  {
    id: 'EM67890',
    title: 'Aquisição de Equipamentos Hospitalares',
    officialStatus: 'Em Análise',
    internalStatus: 'Em Revisão',
    responsible: 'Carlos Pereira',
    creationDate: '2023-03-22',
    totalValue: 750000,
    description: 'Compra de novos equipamentos para o hospital municipal.',
    origin: 'Emenda de Bancada Estadual',
    type: 'Custeio',
    observations: 'Aguardando parecer técnico da secretaria de saúde.',
    lastUpdate: '2024-05-10',
  },
  {
    id: 'EM54321',
    title: 'Reforma de Escolas Municipais',
    officialStatus: 'Pendente',
    internalStatus: 'Rascunho',
    responsible: 'Mariana Costa',
    creationDate: '2024-02-10',
    totalValue: 1200000,
    description:
      'Reforma estrutural e modernização de 5 escolas da rede municipal.',
    origin: 'Emenda Parlamentar Federal',
    type: 'Investimento',
    observations: 'Documentação inicial em fase de elaboração.',
    lastUpdate: '2024-04-30',
  },
  {
    id: 'EM09876',
    title: 'Incentivo ao Esporte Amador',
    officialStatus: 'Rejeitado',
    internalStatus: 'Concluído',
    responsible: 'João Santos',
    creationDate: '2023-05-01',
    totalValue: 150000,
    description: 'Apoio a projetos de esporte em comunidades carentes.',
    origin: 'Emenda Individual Municipal',
    type: 'Custeio',
    observations: 'Projeto não atendeu aos critérios de elegibilidade.',
    lastUpdate: '2023-06-15',
  },
  {
    id: 'EM11223',
    title: 'Digitalização de Acervo Público',
    officialStatus: 'Aprovado',
    internalStatus: 'Aguardando Repasse',
    responsible: 'Ana Silva',
    creationDate: '2023-08-19',
    totalValue: 300000,
    description: 'Modernização do arquivo histórico da cidade.',
    origin: 'Emenda de Bancada Estadual',
    type: 'Investimento',
    observations: 'Aguardando liberação dos recursos pelo governo estadual.',
    lastUpdate: '2024-03-05',
  },
]

export const amendmentDetails = {
  ...amendments[0],
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
