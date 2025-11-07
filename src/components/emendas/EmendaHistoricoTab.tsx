import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Historico } from '@/lib/mock-data'

interface EmendaHistoricoTabProps {
  historico: Historico[]
}

export const EmendaHistoricoTab = ({ historico }: EmendaHistoricoTabProps) => {
  const sortedHistory = [...historico].sort(
    (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime(),
  )

  return (
    <Card className="rounded-2xl shadow-sm border border-neutral-200">
      <CardHeader>
        <CardTitle className="font-medium text-neutral-800">
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium text-neutral-800">
                Data/Hora
              </TableHead>
              <TableHead className="font-medium text-neutral-800">
                Usuário
              </TableHead>
              <TableHead className="font-medium text-neutral-800">
                Evento
              </TableHead>
              <TableHead className="font-medium text-neutral-800">
                Detalhes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHistory.map((h) => (
              <TableRow key={h.id} className="text-neutral-600">
                <TableCell>
                  {new Date(h.criado_em).toLocaleString('pt-BR')}
                </TableCell>
                <TableCell>{h.feito_por}</TableCell>
                <TableCell>{h.evento}</TableCell>
                <TableCell>{h.detalhe}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
