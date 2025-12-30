import { useMemo } from 'react'
import { Amendment } from '@/lib/mock-data'
import { FinancialSummaryCard } from './FinancialSummaryCard'

interface FinancialSummaryProps {
  amendments: Amendment[]
}

export const FinancialSummary = ({ amendments }: FinancialSummaryProps) => {
  const summaryData = useMemo(() => {
    const macAmendments = amendments.filter(
      (a) => a.tipo_recurso === 'INCREMENTO_MAC',
    )
    const papAmendments = amendments.filter(
      (a) => a.tipo_recurso === 'INCREMENTO_PAP',
    )

    const totalMac = macAmendments.reduce((sum, a) => sum + a.valor_total, 0)
    const paidMac = macAmendments
      .filter((a) => a.situacao === 'PAGA')
      .reduce((sum, a) => sum + a.valor_total, 0)

    const totalPap = papAmendments.reduce((sum, a) => sum + a.valor_total, 0)
    const paidPap = papAmendments
      .filter((a) => a.situacao === 'PAGA')
      .reduce((sum, a) => sum + a.valor_total, 0)

    return {
      mac: { total: totalMac, paid: paidMac },
      pap: { total: totalPap, paid: paidPap },
    }
  }, [amendments])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div
        className="animate-fade-in-up opacity-0"
        style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
      >
        <FinancialSummaryCard
          title="Incremento MAC"
          totalValue={summaryData.mac.total}
          paidValue={summaryData.mac.paid}
          type="MAC"
        />
      </div>
      <div
        className="animate-fade-in-up opacity-0"
        style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
      >
        <FinancialSummaryCard
          title="Incremento PAP"
          totalValue={summaryData.pap.total}
          paidValue={summaryData.pap.paid}
          type="PAP"
        />
      </div>
    </div>
  )
}
