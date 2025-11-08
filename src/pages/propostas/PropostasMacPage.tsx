import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { amendments } from '@/lib/mock-data'
import { formatCurrencyBRL } from '@/lib/utils'
import { StatusBadge } from '@/components/StatusBadge'

const PropostasMacPage = () => {
  const navigate = useNavigate()

  const macAmendments = useMemo(() => {
    return amendments.filter((a) => a.tipo_recurso === 'INCREMENTO_MAC')
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Propostas de Incremento MAC
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Propostas ({macAmendments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Autor</TableHead>
                <TableHead>Nº Emenda</TableHead>
                <TableHead>Nº Proposta</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Situação Oficial</TableHead>
                <TableHead>Status Interno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {macAmendments.map((amendment) => (
                <TableRow
                  key={amendment.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/emenda/${amendment.id}`)}
                >
                  <TableCell>{amendment.autor}</TableCell>
                  <TableCell>{amendment.numero_emenda}</TableCell>
                  <TableCell>{amendment.numero_proposta}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrencyBRL(amendment.valor_total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={amendment.situacao} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={amendment.status_interno} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default PropostasMacPage
