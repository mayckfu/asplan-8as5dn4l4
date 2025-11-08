import { useState, useMemo } from 'react'
import {
  FileText,
  Archive,
  Banknote,
  ShieldAlert,
  AlertTriangle,
  Users,
  Megaphone,
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
import { ParlamentarSummarySheet } from './ParlamentarSummarySheet'
import { cn, formatCurrencyBRL } from '@/lib/utils'

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
  const [selectedParlamentar, setSelectedParlamentar] = useState<string | null>(
    null,
  )

  const allDespesas = useMemo(
    () => amendments.flatMap((a) => a.despesas),
    [amendments],
  )

  const parliamentarianData = useMemo(() => {
    const data = amendments.reduce(
      (
        acc,
        amendment,
      ): Record<
        string,
        {
          name: string
          proposals: DetailedAmendment[]
          totalMac: number
          totalPap: number
          totalReceived: number
          totalValue: number
        }
      > => {
        const { parlamentar } = amendment
        if (!acc[parlamentar]) {
          acc[parlamentar] = {
            name: parlamentar,
            proposals: [],
            totalMac: 0,
            totalPap: 0,
            totalReceived: 0,
            totalValue: 0,
          }
        }
        acc[parlamentar].proposals.push(amendment)
        if (amendment.tipo_recurso === 'INCREMENTO_MAC') {
          acc[parlamentar].totalMac += amendment.valor_total
        }
        if (amendment.tipo_recurso === 'INCREMENTO_PAP') {
          acc[parlamentar].totalPap += amendment.valor_total
        }
        acc[parlamentar].totalReceived += amendment.total_repassado
        acc[parlamentar].totalValue += amendment.valor_total
        return acc
      },
      {},
    )

    return Object.values(data)
      .map((p) => ({
        ...p,
        proposalCount: p.proposals.length,
        totalPending: p.totalValue - p.totalReceived,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
  }, [amendments])

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

  const parlamentarProposals = useMemo(() => {
    if (!selectedParlamentar) return []
    const data = parliamentarianData.find((p) => p.name === selectedParlamentar)
    return data ? data.proposals : []
  }, [selectedParlamentar, parliamentarianData])

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
            defaultValue="parlamentares"
          >
            <AccordionItem value="parlamentares" className="border-b-0">
              <AccordionTrigger className="p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-muted -mx-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-asplan-blue-neutral" />
                  <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                    Por Parlamentar
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pl-2 space-y-2">
                {parliamentarianData.map((p) => (
                  <div
                    key={p.name}
                    className="p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-muted"
                    onClick={() => setSelectedParlamentar(p.name)}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm">{p.name}</p>
                      <Badge variant="secondary">{p.proposalCount}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 grid grid-cols-2 gap-x-2 tabular-nums">
                      <span>MAC: {formatCurrencyBRL(p.totalMac)}</span>
                      <span>PAP: {formatCurrencyBRL(p.totalPap)}</span>
                      <span>
                        Recebido: {formatCurrencyBRL(p.totalReceived)}
                      </span>
                      <span
                        className={cn({
                          'text-destructive font-semibold': p.totalPending > 0,
                        })}
                      >
                        Pendente: {formatCurrencyBRL(p.totalPending)}
                      </span>
                    </div>
                  </div>
                ))}
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
      <ParlamentarSummarySheet
        isOpen={!!selectedParlamentar}
        onOpenChange={(isOpen) => !isOpen && setSelectedParlamentar(null)}
        parlamentarName={selectedParlamentar}
        proposals={parlamentarProposals}
      />
    </>
  )
}
