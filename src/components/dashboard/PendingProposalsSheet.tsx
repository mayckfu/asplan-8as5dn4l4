import { useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useNavigate } from 'react-router-dom'
import { DetailedAmendment } from '@/lib/mock-data'
import { formatCurrencyBRL } from '@/lib/utils'
import { StatusBadge } from '@/components/StatusBadge'
import { Users, ChevronRight } from 'lucide-react'

interface PendingProposalsSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  pendingType: string | null
  proposals: DetailedAmendment[]
}

export const PendingProposalsSheet = ({
  isOpen,
  onOpenChange,
  pendingType,
  proposals,
}: PendingProposalsSheetProps) => {
  const navigate = useNavigate()

  const parliamentarians = useMemo(() => {
    if (pendingType !== 'Por Parlamentar') return []

    const groups = proposals.reduce(
      (acc, proposal) => {
        const name = proposal.parlamentar || 'Desconhecido'
        if (!acc[name]) {
          acc[name] = {
            name,
            count: 0,
            totalValue: 0,
          }
        }
        acc[name].count += 1
        acc[name].totalValue += proposal.valor_total
        return acc
      },
      {} as Record<string, { name: string; count: number; totalValue: number }>,
    )

    return Object.values(groups).sort((a, b) => b.totalValue - a.totalValue)
  }, [pendingType, proposals])

  if (!pendingType) return null

  const handleParliamentarianClick = (name: string) => {
    onOpenChange(false)
    navigate(`/emendas?autor=${encodeURIComponent(name)}`)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-neutral-900 dark:text-neutral-200">
            {pendingType === 'Por Parlamentar'
              ? 'Parlamentares'
              : 'Propostas com Pendência'}
          </SheetTitle>
          <SheetDescription className="text-neutral-600 dark:text-neutral-400">
            {pendingType} (
            {pendingType === 'Por Parlamentar'
              ? parliamentarians.length
              : proposals.length}
            )
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-4 pr-4">
            {pendingType === 'Por Parlamentar'
              ? parliamentarians.map((p) => (
                  <Card
                    key={p.name}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleParliamentarianClick(p.name)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-200">
                            {p.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {p.count} emendas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums text-sm">
                          {formatCurrencyBRL(p.totalValue)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : proposals.map((proposal) => (
                  <Link
                    to={`/emenda/${proposal.id}`}
                    key={proposal.id}
                    onClick={() => onOpenChange(false)}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-base font-semibold">
                            {proposal.numero_proposta}
                          </CardTitle>
                          <StatusBadge
                            status={proposal.status_interno}
                            className="whitespace-normal text-right h-auto py-1 max-w-[60%]"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {proposal.autor}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Valor Total
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatCurrencyBRL(proposal.valor_total)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
