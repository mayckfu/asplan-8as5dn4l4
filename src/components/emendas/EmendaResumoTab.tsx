import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DetailedAmendment,
  SituacaoOficial,
  StatusInterno,
  TipoRecurso,
} from '@/lib/mock-data'

interface EmendaResumoTabProps {
  emenda: DetailedAmendment
}

const DetailItem = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div>
    <p className="text-sm font-medium text-neutral-600">{label}</p>
    <p className="text-base text-neutral-800">{children || '-'}</p>
  </div>
)

export const EmendaResumoTab = ({ emenda }: EmendaResumoTabProps) => {
  return (
    <Card className="rounded-2xl shadow-sm border border-neutral-200">
      <CardHeader>
        <CardTitle className="font-medium text-neutral-800">
          Resumo da Emenda
        </CardTitle>
        <CardDescription className="text-neutral-600">
          Informações gerais sobre a emenda.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailItem label="Número da Proposta">
          {emenda.numero_proposta}
        </DetailItem>
        <DetailItem label="Número da Emenda">{emenda.numero_emenda}</DetailItem>
        <DetailItem label="Autor">{emenda.autor}</DetailItem>
        <DetailItem label="Tipo">{emenda.tipo}</DetailItem>
        <DetailItem label="Tipo de Recurso">
          {TipoRecurso[emenda.tipo_recurso]}
        </DetailItem>
        <DetailItem label="Situação Oficial">
          {SituacaoOficial[emenda.situacao]}
        </DetailItem>
        <DetailItem label="Status Interno">
          {StatusInterno[emenda.status_interno]}
        </DetailItem>
        <DetailItem label="Valor Total">
          <span className="tabular-nums">
            {emenda.valor_total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </DetailItem>
        <DetailItem label="Data de Criação">
          {new Date(emenda.created_at).toLocaleDateString('pt-BR')}
        </DetailItem>
        <DetailItem label="Portaria">{emenda.portaria}</DetailItem>
        <DetailItem label="Deliberação CIE">
          {emenda.deliberacao_cie}
        </DetailItem>
        <div className="md:col-span-2 lg:col-span-3">
          <DetailItem label="Descrição Completa">
            {emenda.descricao_completa}
          </DetailItem>
        </div>
      </CardContent>
    </Card>
  )
}
