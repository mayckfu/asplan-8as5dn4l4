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

// Updated with high-contrast colors (text-white for dark backgrounds)
const statusColors: Record<string, string> = {
  // Oficial
  PAGA: 'bg-emerald-600 text-white border-emerald-700',
  EMPENHADA_AGUARDANDO_FORMALIZACAO: 'bg-blue-600 text-white border-blue-700',
  FAVORAVEL: 'bg-sky-600 text-white border-sky-700',
  EM_ANALISE: 'bg-indigo-600 text-white border-indigo-700',
  LIBERADO_PAGAMENTO_FNS: 'bg-teal-600 text-white border-teal-700',
  OUTRA: 'bg-neutral-500 text-white border-neutral-600',

  // Interno
  RASCUNHO: 'bg-neutral-400 text-white border-neutral-500',
  EM_EXECUCAO: 'bg-blue-600 text-white border-blue-700',
  PAGA_SEM_DOCUMENTOS: 'bg-amber-600 text-white border-amber-700',
  PAGA_COM_PENDENCIAS: 'bg-orange-600 text-white border-orange-700',
  CONCLUIDA: 'bg-emerald-700 text-white border-emerald-800',
  PROPOSTA_PAGA: 'bg-emerald-600 text-white border-emerald-700',
  EM_ANALISE_PAGAMENTO: 'bg-indigo-500 text-white border-indigo-600',
  APROVADA_PAGAMENTO: 'bg-teal-600 text-white border-teal-700',
  AUTORIZADA_AGUARDANDO_EMPENHO: 'bg-blue-500 text-white border-blue-600',
  AGUARDANDO_AUTORIZACAO_FNS: 'bg-orange-500 text-white border-orange-600',
  PORTARIA_PUBLICADA_AGUARDANDO_FNS:
    'bg-purple-600 text-white border-purple-700',
  ENVIADA_PUBLICACAO_PORTARIA: 'bg-violet-600 text-white border-violet-700',
  PROPOSTA_APROVADA: 'bg-green-600 text-white border-green-700',
  CLASSIFICADA_AGUARDANDO_SECRETARIA:
    'bg-yellow-600 text-white border-yellow-700',

  // Others
  Pendente: 'bg-amber-500 text-white border-amber-600',
  Aprovado: 'bg-green-600 text-white border-green-700',
  Rejeitado: 'bg-red-600 text-white border-red-700',
  'Em Análise': 'bg-indigo-500 text-white border-indigo-600',
  'Em Revisão': 'bg-blue-500 text-white border-blue-600',
  'Aguardando Repasse': 'bg-purple-500 text-white border-purple-600',
  Concluído: 'bg-emerald-600 text-white border-emerald-700',
  Realizado: 'bg-emerald-600 text-white border-emerald-700',
  Aprovada: 'bg-green-600 text-white border-green-700',
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const displayText = statusDisplayMap[status] || status
  return (
    <Badge
      className={cn(
        'whitespace-nowrap px-3 py-1 text-xs font-semibold shadow-sm border',
        statusColors[status] || 'bg-neutral-500 text-white border-neutral-600',
        className,
      )}
    >
      {displayText}
    </Badge>
  )
}
