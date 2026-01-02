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
    // MAC Data
    const macAmendments = amendments.filter(
      (a) => a.tipo_recurso === 'INCREMENTO_MAC',
    )
    const totalMac = macAmendments.reduce((sum, a) => sum + a.valor_total, 0)
    const paidMac = macAmendments
      .filter((a) => a.situacao === 'PAGA')
      .reduce((sum, a) => sum + a.valor_total, 0)

    // PAP Data
    const papAmendments = amendments.filter(
      (a) => a.tipo_recurso === 'INCREMENTO_PAP',
    )
    const totalPap = papAmendments.reduce((sum, a) => sum + a.valor_total, 0)
    const paidPap = papAmendments
      .filter((a) => a.situacao === 'PAGA')
      .reduce((sum, a) => sum + a.valor_total, 0)

    // General Pending Data (All types)
    const totalGeneral = amendments.reduce((sum, a) => sum + a.valor_total, 0)
    const totalReceived = repasses.reduce((sum, r) => sum + r.valor, 0)

    return {
      mac: { total: totalMac, paid: paidMac },
      pap: { total: totalPap, paid: paidPap },
      general: { total: totalGeneral, received: totalReceived },
    }
  }, [amendments, repasses])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      <div
        className="animate-fade-in-up opacity-0"
        style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
      >
        <FinancialSummaryCard
          title="Saldo Pendente"
          totalValue={summaryData.general.total}
          paidValue={summaryData.general.total - summaryData.general.received}
          type="PENDING"
          progressLabel="Pendente de Repasse"
          paidLabel="Pendente"
        />
      </div>
    </div>
  )
}
