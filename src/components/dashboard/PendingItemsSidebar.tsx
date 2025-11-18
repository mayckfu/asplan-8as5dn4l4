import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Archive,
  Banknote,
  ShieldAlert,
  AlertTriangle,
  Megaphone,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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

  const missingPortariaAmendments = useMemo(
    () => amendments.filter((a) => !a.portaria),
    [amendments],
  )

  const pendingItems: AlertItem[] = useMemo(
    () => [
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
      {
        title: 'Propostas de Alto Valor',
        count: amendments.filter((a) => a.valor_total > 500000).length,
        icon: Megaphone,
        filter: (a) => a.valor_total > 500000,
        color:
          'bg-highlight/10 dark:bg-highlight/20 border-l-4 border-highlight',
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
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="falta-portaria"
          >
            <AccordionItem value="falta-portaria" className="border-b-0">
              <AccordionTrigger className="p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-muted -mx-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                    Falta Portaria
                  </span>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {missingPortariaAmendments.length}
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pl-2 space-y-2">
                {missingPortariaAmendments.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">
                    Nenhuma emenda com falta de portaria.
                  </p>
                ) : (
                  missingPortariaAmendments.map((a) => (
                    <Link
                      to={`/emenda/${a.id}`}
                      key={a.id}
                      className="block p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-muted transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                          {a.numero_proposta || a.numero_emenda}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{a.parlamentar}</span>
                      </div>
                    </Link>
                  ))
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <ul className="space-y-3 mt-2">
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
