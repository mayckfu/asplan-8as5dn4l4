import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DetailedAmendment } from '@/lib/mock-data'

interface EmendaDadosTecnicosProps {
  emenda: DetailedAmendment
}

const DetailItem = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  <div>
    <p className="text-sm text-neutral-500">{label}</p>
    <p className="text-base font-medium text-neutral-900 dark:text-neutral-200">
      {value || '-'}
    </p>
  </div>
)

export const EmendaDadosTecnicos = ({ emenda }: EmendaDadosTecnicosProps) => {
  return (
    <Card className="rounded-xl border border-neutral-200 p-4 shadow-sm bg-white dark:bg-card">
      <CardHeader className="p-2">
        <CardTitle className="text-lg font-semibold text-asplan-deep">
          📘 Dados Técnicos da Emenda
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Natureza" value={emenda.natureza} />
        <DetailItem label="Objeto" value={emenda.objeto_emenda} />
        <DetailItem label="Meta Operacional" value={emenda.meta_operacional} />
        <DetailItem
          label="Destino do Recurso / Responsável pelo Gasto"
          value={emenda.destino_recurso}
        />
        <DetailItem
          label="Data do Repasse"
          value={
            emenda.data_repasse
              ? new Date(emenda.data_repasse).toLocaleDateString('pt-BR')
              : '-'
          }
        />
        <DetailItem label="Portaria" value={emenda.portaria} />
        <DetailItem label="Deliberação CIE" value={emenda.deliberacao_cie} />
        <DetailItem
          label="Situação do Recurso"
          value={emenda.situacao_recurso}
        />
        <div className="md:col-span-2">
          <DetailItem label="Observações" value={emenda.observacoes} />
        </div>
      </CardContent>
    </Card>
  )
}
