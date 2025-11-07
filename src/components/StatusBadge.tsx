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
  PAGA: 'bg-success text-white',
  EMPENHADA_AGUARDANDO_FORMALIZACAO: 'bg-blue-500 text-white',
  FAVORAVEL: 'bg-sky-500 text-white',
  EM_ANALISE: 'bg-info text-white',
  LIBERADO_PAGAMENTO_FNS: 'bg-teal-500 text-white',
  OUTRA: 'bg-gray-500 text-white',
  RASCUNHO: 'bg-gray-400 text-white',
  EM_EXECUCAO: 'bg-purple-500 text-white',
  PAGA_SEM_DOCUMENTOS: 'bg-orange-400 text-white',
  PAGA_COM_PENDENCIAS: 'bg-amber-500 text-black',
  CONCLUIDA: 'bg-green-700 text-white',
  Pendente: 'bg-warning text-gray-800',
  Aprovado: 'bg-success text-white',
  Rejeitado: 'bg-danger text-white',
  'Em Análise': 'bg-info text-white',
  'Em Revisão': 'bg-blue-400 text-white',
  'Aguardando Repasse': 'bg-purple-500 text-white',
  Concluído: 'bg-green-700 text-white',
  Realizado: 'bg-success text-white',
  Aprovada: 'bg-success text-white',
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const displayText = statusDisplayMap[status] || status
  return (
    <Badge
      className={cn(
        'border-transparent whitespace-nowrap',
        statusColors[status],
      )}
    >
      {displayText}
    </Badge>
  )
}
