import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DetailedAmendment,
  SituacaoOficial,
  StatusInterno,
  SituacaoOficialEnum,
  StatusInternoEnum,
} from '@/lib/mock-data'
import { Paperclip } from 'lucide-react'
import { formatCurrencyBRL, formatPercent } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'

interface EmendaDetailHeaderProps {
  emenda: DetailedAmendment
  onStatusOficialChange: (status: SituacaoOficialEnum) => void
  onStatusInternoChange: (status: StatusInternoEnum) => void
}

export const EmendaDetailHeader = ({
  emenda,
  onStatusOficialChange,
  onStatusInternoChange,
}: EmendaDetailHeaderProps) => {
  const { checkPermission } = useAuth()
  const canEdit = checkPermission(['ADMIN', 'GESTOR', 'ANALISTA'])

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
    if (format === 'currency') return formatCurrencyBRL(value)
    if (format === 'percent') return formatPercent(value)
    return value
  }

  return (
    <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl md:text-2xl text-neutral-900 dark:text-neutral-200">
              {emenda.numero_proposta}
            </CardTitle>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {emenda.autor}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 sm:mr-2">
              <Paperclip className="h-4 w-4" />
              {emenda.anexos.length} Anexos
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                STATUS OFICIAL
              </span>
              <Select
                value={emenda.situacao}
                onValueChange={(value) =>
                  onStatusOficialChange(value as SituacaoOficialEnum)
                }
                disabled={!canEdit}
              >
                <SelectTrigger className="h-10 md:h-9 w-full sm:w-[240px] bg-white dark:bg-background">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SituacaoOficial).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                STATUS INTERNO
              </span>
              <Select
                value={emenda.status_interno}
                onValueChange={(value) =>
                  onStatusInternoChange(value as StatusInternoEnum)
                }
                disabled={!canEdit}
              >
                <SelectTrigger className="h-10 md:h-9 w-full sm:w-[320px] bg-white dark:bg-background">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(StatusInterno).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="p-3 rounded-xl bg-white shadow-sm border border-neutral-200 dark:bg-card"
            >
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {kpi.label}
              </p>
              <p className="text-2xl font-semibold tabular-nums leading-tight text-neutral-900 dark:text-neutral-200">
                {formatValue(kpi.value, kpi.format)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
