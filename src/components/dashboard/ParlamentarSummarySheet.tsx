import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { DetailedAmendment } from '@/lib/mock-data'
import { formatCurrencyBRL } from '@/lib/utils'
import { StatusBadge } from '@/components/StatusBadge'

interface ParlamentarSummarySheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  parlamentarName: string | null
  proposals: DetailedAmendment[]
}

export const ParlamentarSummarySheet = ({
  isOpen,
  onOpenChange,
  parlamentarName,
  proposals,
}: ParlamentarSummarySheetProps) => {
  if (!parlamentarName) return null

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-neutral-900 dark:text-neutral-200">
            Propostas Indicadas
          </SheetTitle>
          <SheetDescription className="text-neutral-600 dark:text-neutral-400">
            {parlamentarName} ({proposals.length})
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-4 pr-4">
            {proposals.map((proposal) => (
              <Link to={`/emenda/${proposal.id}`} key={proposal.id}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-semibold">
                        {proposal.numero_proposta}
                      </CardTitle>
                      <StatusBadge status={proposal.status_interno} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {proposal.autor}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor Total</span>
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
