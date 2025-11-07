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
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const displayText = statusDisplayMap[status] || status
  return (
    <Badge
      className={cn(
        'border-transparent whitespace-nowrap',
        statusColors[status] || 'bg-secondary text-secondary-foreground',
      )}
    >
      {displayText}
    </Badge>
  )
}
