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
    <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 bg-background/90 backdrop-blur-sm z-10">
                <TableHead className="font-medium text-neutral-900 dark:text-neutral-200">
                  Data/Hora
                </TableHead>
                <TableHead className="font-medium text-neutral-900 dark:text-neutral-200">
                  Usuário
                </TableHead>
                <TableHead className="font-medium text-neutral-900 dark:text-neutral-200">
                  Evento
                </TableHead>
                <TableHead className="font-medium text-neutral-900 dark:text-neutral-200">
                  Detalhes
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map((h) => (
                <TableRow
                  key={h.id}
                  className="h-10 py-2 text-neutral-600 dark:text-neutral-400 odd:bg-white even:bg-neutral-50 hover:bg-neutral-100 dark:odd:bg-card dark:even:bg-muted/50 dark:hover:bg-muted"
                >
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
        </div>
      </CardContent>
    </Card>
  )
}
