import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { DetailedAmendment } from '@/lib/mock-data'
import { Paperclip } from 'lucide-react'

interface EmendaDetailHeaderProps {
  emenda: DetailedAmendment
}

export const EmendaDetailHeader = ({ emenda }: EmendaDetailHeaderProps) => {
  const totalRepassado = emenda.repasses.reduce((acc, r) => acc + r.valor, 0)
  const totalGasto = emenda.despesas.reduce((acc, d) => acc + d.valor, 0)
  const execucaoPercent =
    totalRepassado > 0 ? (totalGasto / totalRepassado) * 100 : 0
  const coberturaPercent =
    emenda.valor_total > 0 ? (totalGasto / emenda.valor_total) * 100 : 0

  const kpis = [
    { label: 'Valor Total', value: emenda.valor_total, format: 'currency' },
    { label: 'Repassado', value: totalRepassado, format: 'currency' },
    { label: 'Gasto', value: totalGasto, format: 'currency' },
    { label: 'Execução', value: execucaoPercent, format: 'percent' },
    { label: 'Cobertura', value: coberturaPercent, format: 'percent' },
  ]

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    }
    if (format === 'percent') {
      return `${value.toFixed(1)}%`
    }
    return value
  }

  return (
    <Card className="rounded-2xl shadow-sm border border-neutral-200">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl text-neutral-800">
              {emenda.numero_proposta}
            </CardTitle>
            <p className="text-sm text-neutral-600">{emenda.autor}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
              <Paperclip className="h-4 w-4" />
              {emenda.anexos.length} Anexos
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-600">
                STATUS OFICIAL
              </span>
              <StatusBadge status={emenda.situacao} />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-600">
                STATUS INTERNO
              </span>
              <StatusBadge status={emenda.status_interno} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center mb-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="p-2 rounded-lg bg-muted">
              <p className="text-sm font-medium text-neutral-600">
                {kpi.label}
              </p>
              <p className="text-xl font-bold text-neutral-800 tabular-nums">
                {formatValue(kpi.value, kpi.format)}
              </p>
            </div>
          ))}
        </div>
        {emenda.pendencias.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-neutral-800">
              Pendências:
            </h4>
            <div className="flex flex-wrap gap-2">
              {emenda.pendencias
                .filter((p) => !p.dispensada)
                .map((p) => (
                  <Badge key={p.id} variant="destructive">
                    {p.descricao}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
