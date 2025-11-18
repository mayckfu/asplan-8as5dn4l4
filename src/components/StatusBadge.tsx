import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  SituacaoOficial,
  StatusInterno,
  SituacaoOficialEnum,
  StatusInternoEnum,
} from '@/lib/mock-data'

type Status =
  | SituacaoOficialEnum
  | StatusInternoEnum
  | 'Pendente'
  | 'Aprovado'
  | 'Rejeitado'
  | 'Em Análise'
  | 'Rascunho'
  | 'Em Revisão'
  | 'Aguardando Repasse'
  | 'Concluído'
  | 'Realizado'
  | 'Aprovada'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusDisplayMap: Record<string, string> = {
  ...SituacaoOficial,
  ...StatusInterno,
  Pendente: 'Pendente',
  Aprovado: 'Aprovado',
  Rejeitado: 'Rejeitado',
  'Em Análise': 'Em Análise',
  Rascunho: 'Rascunho',
  'Em Revisão': 'Em Revisão',
  'Aguardando Repasse': 'Aguardando Repasse',
  Concluído: 'Concluído',
  Realizado: 'Realizado',
  Aprovada: 'Aprovada',
}

const statusColors: Record<string, string> = {
  PAGA: 'bg-success text-primary-foreground',
  EMPENHADA_AGUARDANDO_FORMALIZACAO: 'bg-blue-500 text-white',
  FAVORAVEL: 'bg-sky-500 text-white',
  EM_ANALISE: 'bg-info text-primary-foreground',
  LIBERADO_PAGAMENTO_FNS: 'bg-teal-500 text-white',
  OUTRA: 'bg-muted text-muted-foreground',
  RASCUNHO: 'bg-muted text-muted-foreground',
  EM_EXECUCAO: 'bg-primary/80 text-primary-foreground',
  PAGA_SEM_DOCUMENTOS: 'bg-warning text-primary-foreground',
  PAGA_COM_PENDENCIAS: 'bg-warning text-primary-foreground',
  CONCLUIDA: 'bg-success text-primary-foreground',
  Pendente: 'bg-warning text-primary-foreground',
  Aprovado: 'bg-success text-primary-foreground',
  Rejeitado: 'bg-destructive text-destructive-foreground',
  'Em Análise': 'bg-info text-primary-foreground',
  'Em Revisão': 'bg-blue-400 text-white',
  'Aguardando Repasse': 'bg-purple-500 text-white',
  Concluído: 'bg-success text-primary-foreground',
  Realizado: 'bg-success text-primary-foreground',
  Aprovada: 'bg-success text-primary-foreground',

  // New Statuses Colors
  PROPOSTA_PAGA: 'bg-success text-primary-foreground',
  EM_ANALISE_PAGAMENTO: 'bg-info text-primary-foreground',
  APROVADA_PAGAMENTO: 'bg-teal-500 text-white',
  AUTORIZADA_AGUARDANDO_EMPENHO: 'bg-blue-500 text-white',
  AGUARDANDO_AUTORIZACAO_FNS: 'bg-orange-500 text-white',
  PORTARIA_PUBLICADA_AGUARDANDO_FNS: 'bg-purple-500 text-white',
  ENVIADA_PUBLICACAO_PORTARIA: 'bg-indigo-500 text-white',
  PROPOSTA_APROVADA: 'bg-green-600 text-white',
  CLASSIFICADA_AGUARDANDO_SECRETARIA: 'bg-yellow-500 text-white',
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const displayText = statusDisplayMap[status] || status
  return (
    <Badge
      className={cn(
        'border-transparent whitespace-nowrap',
        statusColors[status] || 'bg-secondary text-secondary-foreground',
        className,
      )}
    >
      {displayText}
    </Badge>
  )
}
