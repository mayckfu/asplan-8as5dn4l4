import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type Status =
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

const statusColors: Record<Status, string> = {
  // Official Status
  Pendente: 'bg-warning text-gray-800',
  Aprovado: 'bg-success text-white',
  Rejeitado: 'bg-danger text-white',
  'Em Análise': 'bg-info text-white',
  // Internal Status
  Rascunho: 'bg-gray-400 text-white',
  'Em Revisão': 'bg-blue-400 text-white',
  'Aguardando Repasse': 'bg-purple-500 text-white',
  Concluído: 'bg-green-700 text-white',
  // Transfer/Expense Status
  Realizado: 'bg-success text-white',
  Aprovada: 'bg-success text-white',
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge className={cn('border-transparent', statusColors[status])}>
      {status}
    </Badge>
  )
}
