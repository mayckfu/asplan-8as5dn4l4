import { useState, useMemo } from 'react'
import {
  FileText,
  Archive,
  Banknote,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DetailedAmendment } from '@/lib/mock-data'
import { PendingProposalsSheet } from './PendingProposalsSheet'
import { cn } from '@/lib/utils'

type AlertItem = {
  title: string
  count: number
  icon: React.ElementType
  filter: (amendment: DetailedAmendment) => boolean
  color: string
}

interface PendingItemsSidebarProps {
  amendments: DetailedAmendment[]
}

export const PendingItemsSidebar = ({
  amendments,
}: PendingItemsSidebarProps) => {
  const [selectedPending, setSelectedPending] = useState<string | null>(null)

  const allDespesas = useMemo(
    () => amendments.flatMap((a) => a.despesas),
    [amendments],
  )

  const pendingItems: AlertItem[] = useMemo(
    () => [
      {
        title: 'Falta Portaria',
        count: amendments.filter((a) => !a.portaria).length,
        icon: FileText,
        filter: (a) => !a.portaria,
        color: 'border-l-4 border-amber-400',
      },
      {
        title: 'Falta Deliberação CIE',
        count: amendments.filter((a) => !a.deliberacao_cie).length,
        icon: FileText,
        filter: (a) => !a.deliberacao_cie,
        color: 'border-l-4 border-blue-400',
      },
      {
        title: 'Sem Anexos Essenciais',
        count: amendments.filter((a) => !a.anexos_essenciais).length,
        icon: Archive,
        filter: (a) => !a.anexos_essenciais,
        color: 'border-l-4 border-red-400',
      },
      {
        title: 'Sem Repasses',
        count: amendments.filter((a) => a.total_repassado <= 0).length,
        icon: Banknote,
        filter: (a) => a.total_repassado <= 0,
        color: 'border-l-4 border-orange-400',
      },
      {
        title: 'Despesas sem autorização',
        count: allDespesas.filter((d) => !d.autorizada_por).length,
        icon: ShieldAlert,
        filter: (a) => a.despesas.some((d) => !d.autorizada_por),
        color: 'border-l-4 border-yellow-400',
      },
      {
        title: 'Despesas > Repasses',
        count: amendments.filter((a) => a.total_gasto > a.total_repassado)
          .length,
        icon: AlertTriangle,
        filter: (a) => a.total_gasto > a.total_repassado,
        color: 'border-l-4 border-destructive',
      },
    ],
    [amendments, allDespesas],
  )

  const filteredProposals = useMemo(() => {
    if (!selectedPending) return []
    const pendingItem = pendingItems.find((p) => p.title === selectedPending)
    if (!pendingItem) return []
    return amendments.filter(pendingItem.filter)
  }, [selectedPending, pendingItems, amendments])

  return (
    <>
      <Card className="bg-white rounded-2xl border border-neutral-200 shadow-sm h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-asplan-deep">
            Pendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {pendingItems
              .filter((item) => item.count > 0)
              .map((item) => (
                <li
                  key={item.title}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-all hover:bg-neutral-100 dark:hover:bg-muted',
                    item.color,
                  )}
                  onClick={() => setSelectedPending(item.title)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-asplan-blue-neutral" />
                      <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                        {item.title}
                      </span>
                    </div>
                    <span className="font-bold text-asplan-primary tabular-nums">
                      {item.count}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
      <PendingProposalsSheet
        isOpen={!!selectedPending}
        onOpenChange={(isOpen) => !isOpen && setSelectedPending(null)}
        pendingType={selectedPending}
        proposals={filteredProposals}
      />
    </>
  )
}
