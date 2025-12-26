import { useState, useMemo } from 'react'
import {
  FileText,
  Archive,
  Banknote,
  ShieldAlert,
  AlertTriangle,
  Megaphone,
  Users,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DetailedAmendment } from '@/lib/mock-data'
import { PendingProposalsSheet } from './PendingProposalsSheet'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type AlertItem = {
  title: string
  count: number
  icon: React.ElementType
  filter: (amendment: DetailedAmendment) => boolean
  colorClass: string
  iconColorClass: string
}

interface PendingItemsSidebarProps {
  amendments: DetailedAmendment[]
}

const isDismissed = (amendment: DetailedAmendment, targetId: string) => {
  return amendment.pendencias.some(
    (p) => p.targetId === targetId && (p.dispensada || p.resolvida),
  )
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
        count: amendments.filter(
          (a) => !a.portaria && !isDismissed(a, 'portaria'),
        ).length,
        icon: FileText,
        filter: (a) => !a.portaria && !isDismissed(a, 'portaria'),
        colorClass: 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
        iconColorClass: 'text-amber-500',
      },
      {
        title: 'Falta Deliberação CIE',
        count: amendments.filter(
          (a) => !a.deliberacao_cie && !isDismissed(a, 'cie'),
        ).length,
        icon: FileText,
        filter: (a) => !a.deliberacao_cie && !isDismissed(a, 'cie'),
        colorClass: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
        iconColorClass: 'text-blue-500',
      },
      {
        title: 'Sem Anexos Essenciais',
        count: amendments.filter(
          (a) =>
            !a.anexos_essenciais &&
            !isDismissed(a, 'proposta') &&
            !isDismissed(a, 'oficio'),
        ).length,
        icon: Archive,
        filter: (a) =>
          !a.anexos_essenciais &&
          !isDismissed(a, 'proposta') &&
          !isDismissed(a, 'oficio'),
        colorClass: 'hover:bg-red-50 dark:hover:bg-red-950/30',
        iconColorClass: 'text-red-500',
      },
      {
        title: 'Sem Repasses',
        count: amendments.filter((a) => a.total_repassado <= 0).length,
        icon: Banknote,
        filter: (a) => a.total_repassado <= 0,
        colorClass: 'hover:bg-orange-50 dark:hover:bg-orange-950/30',
        iconColorClass: 'text-orange-500',
      },
      {
        title: 'Despesas sem autorização',
        count: allDespesas.filter((d) => !d.autorizada_por).length,
        icon: ShieldAlert,
        filter: (a) => a.despesas.some((d) => !d.autorizada_por),
        colorClass: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/30',
        iconColorClass: 'text-yellow-500',
      },
      {
        title: 'Despesas > Repasses',
        count: amendments.filter((a) => a.total_gasto > a.total_repassado)
          .length,
        icon: AlertTriangle,
        filter: (a) => a.total_gasto > a.total_repassado,
        colorClass: 'hover:bg-destructive/10',
        iconColorClass: 'text-destructive',
      },
      {
        title: 'Propostas de Alto Valor',
        count: amendments.filter((a) => a.valor_total > 500000).length,
        icon: Megaphone,
        filter: (a) => a.valor_total > 500000,
        colorClass: 'hover:bg-purple-50 dark:hover:bg-purple-950/30',
        iconColorClass: 'text-purple-500',
      },
      {
        title: 'Por Parlamentar',
        count: new Set(amendments.map((a) => a.parlamentar)).size,
        icon: Users,
        filter: () => true,
        colorClass: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/30',
        iconColorClass: 'text-indigo-500',
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
      <Card className="bg-card border-border/50 shadow-sm h-full overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
          <CardTitle className="text-lg font-semibold text-asplan-deep flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-asplan-action" />
            Pendências e Alertas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/50">
            {pendingItems
              .filter((item) => item.count > 0)
              .map((item) => (
                <li
                  key={item.title}
                  className={cn(
                    'group cursor-pointer transition-colors duration-200',
                    item.colorClass,
                  )}
                  onClick={() => setSelectedPending(item.title)}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-full bg-background shadow-sm border border-border/50 group-hover:scale-110 transition-transform',
                          item.iconColorClass,
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm text-foreground group-hover:text-foreground/80">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="font-bold tabular-nums bg-background border-border/50"
                      >
                        {item.count}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </div>
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
