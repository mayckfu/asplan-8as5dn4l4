import { useMemo } from 'react'
import { Amendment, Repasse } from '@/lib/mock-data'
import { FinancialSummaryCard } from './FinancialSummaryCard'

interface FinancialSummaryProps {
  amendments: Amendment[]
  repasses: Repasse[]
}

export const FinancialSummary = ({
  amendments,
  repasses,
}: FinancialSummaryProps) => {
  const summaryData = useMemo(() => {
    // Helper to get repasses for a list of amendments
    const getRepassesValue = (targetAmendments: Amendment[]) => {
      const amendmentIds = new Set(targetAmendments.map((a) => a.id))
      return repasses
        .filter((r) => amendmentIds.has(r.emenda_id))
        .reduce((sum, r) => sum + r.valor, 0)
    }

    // MAC Data
    const macAmendments = amendments.filter(
      (a) => a.tipo_recurso === 'INCREMENTO_MAC',
    )
    const totalMac = macAmendments.reduce((sum, a) => sum + a.valor_total, 0)
    const paidMac = getRepassesValue(macAmendments)
    const pendingMac = totalMac - paidMac

    // PAP Data
    const papAmendments = amendments.filter(
      (a) => a.tipo_recurso === 'INCREMENTO_PAP',
    )
    const totalPap = papAmendments.reduce((sum, a) => sum + a.valor_total, 0)
    const paidPap = getRepassesValue(papAmendments)
    const pendingPap = totalPap - paidPap

    return {
      mac: { total: totalMac, paid: paidMac, pending: pendingMac },
      pap: { total: totalPap, paid: paidPap, pending: pendingPap },
    }
  }, [amendments, repasses])

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
          pendingValue={summaryData.mac.pending}
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
          pendingValue={summaryData.pap.pending}
          type="PAP"
        />
      </div>
    </div>
  )
}
