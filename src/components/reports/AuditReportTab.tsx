import { useState } from 'react'
import {
  DetailedAmendment,
  AuditCategories,
  ActionWithDestinations,
} from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  Package,
  Activity,
  User,
  Box,
  Gift,
} from 'lucide-react'
import { formatCurrencyBRL, cn } from '@/lib/utils'

interface AuditReportTabProps {
  data: DetailedAmendment[]
}

export const AuditReportTab = ({ data }: AuditReportTabProps) => {
  // We want to flatten all Actions from all Amendments to show them in the list
  const allActions = data.flatMap((emenda) =>
    emenda.acoes.map((acao) => {
      const destinationIds = acao.destinacoes.map((d) => d.id)
      const relatedExpenses = emenda.despesas.filter(
        (d) => d.destinacao_id && destinationIds.includes(d.destinacao_id),
      )
      return {
        ...acao,
        portaria: emenda.portaria || '-',
        emenda_numero: emenda.numero_emenda,
        relatedExpenses,
      }
    }),
  )

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">
              Visão de Auditoria Detalhada
            </CardTitle>
            {/* Hierarchy description removed as per user story */}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" title="Download">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Imprimir">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[30%] text-xs font-bold uppercase tracking-wider text-muted-foreground pl-10">
                  Eixo / Ação de Controle
                </TableHead>
                <TableHead className="w-[15%] text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  Valor Total (R$)
                </TableHead>
                <TableHead className="w-[15%] text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  Serviços
                  <br />
                  Terceiros (PJ)
                </TableHead>
                <TableHead className="w-[15%] text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  Material de
                  <br />
                  Consumo
                </TableHead>
                <TableHead className="w-[15%] text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  Distribuição
                  <br />
                  Gratuita
                </TableHead>
                <TableHead className="w-[10%] text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allActions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma ação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                allActions.map((action) => (
                  <AuditActionRow key={action.id} action={action} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

const AuditActionRow = ({
  action,
}: {
  action: ActionWithDestinations & {
    portaria: string
    emenda_numero: string
    relatedExpenses: any[]
  }
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate totals based on Expenses
  const expenses = action.relatedExpenses
  const totalExecuted = expenses.reduce((acc, curr) => acc + curr.valor, 0)

  const servicesTotal = expenses
    .filter((e) => e.categoria === AuditCategories.SERVICOS_TERCEIROS)
    .reduce((acc, curr) => acc + curr.valor, 0)

  const materialsTotal = expenses
    .filter((e) => e.categoria === AuditCategories.MATERIAL_CONSUMO)
    .reduce((acc, curr) => acc + curr.valor, 0)

  const distributionTotal = expenses
    .filter((e) => e.categoria === AuditCategories.DISTRIBUICAO_GRATUITA)
    .reduce((acc, curr) => acc + curr.valor, 0)

  // Determine status
  let status = 'PENDENTE'
  let statusColor = 'bg-neutral-100 text-neutral-600 border-neutral-200'

  if (totalExecuted > 0) {
    status = 'EM ANDAMENTO'
    statusColor = 'bg-blue-100 text-blue-700 border-blue-200'
  }

  // Calculate planned total to check completion
  const totalPlanned = action.destinacoes.reduce(
    (acc, d) => acc + d.valor_destinado,
    0,
  )
  if (totalExecuted >= totalPlanned && totalPlanned > 0) {
    status = 'EXECUTADO'
    statusColor = 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }

  return (
    <>
      <TableRow
        className={cn(
          'cursor-pointer hover:bg-muted/30 transition-colors',
          isExpanded && 'bg-muted/30',
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="pl-4 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">
                {action.nome_acao}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2 max-w-[250px]">
                {action.descricao_oficial || 'Sem descrição oficial'}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 bg-muted px-1.5 py-0.5 rounded-sm w-fit">
                Portaria: {action.portaria}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right align-middle font-bold text-sm">
          {formatCurrencyBRL(totalExecuted)}
        </TableCell>
        <TableCell className="text-right align-middle text-sm text-muted-foreground">
          {servicesTotal > 0 ? (
            <div className="flex items-center justify-end gap-1.5">
              <User className="h-3 w-3 text-blue-500" />
              {formatCurrencyBRL(servicesTotal)}
            </div>
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell className="text-right align-middle text-sm text-muted-foreground">
          {materialsTotal > 0 ? (
            <div className="flex items-center justify-end gap-1.5">
              <Box className="h-3 w-3 text-emerald-500" />
              {formatCurrencyBRL(materialsTotal)}
            </div>
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell className="text-right align-middle text-sm text-muted-foreground">
          {distributionTotal > 0 ? (
            <div className="flex items-center justify-end gap-1.5">
              <Gift className="h-3 w-3 text-amber-500" />
              {formatCurrencyBRL(distributionTotal)}
            </div>
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell className="text-center align-middle">
          <Badge
            variant="outline"
            className={cn('text-[10px] font-bold border', statusColor)}
          >
            {status}
          </Badge>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="hover:bg-transparent bg-muted/10">
          <TableCell colSpan={6} className="p-0 border-b">
            <div className="px-12 py-6 animate-fade-in-down">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Package className="h-4 w-4" />
                Detalhamento de Itens de Despesa
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Services Column */}
                <div className="bg-white dark:bg-card border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Serviços de Terceiros
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatCurrencyBRL(servicesTotal)}
                    </span>
                  </div>
                  <ExpenseList
                    expenses={expenses.filter(
                      (e) => e.categoria === AuditCategories.SERVICOS_TERCEIROS,
                    )}
                  />
                </div>

                {/* Materials Column */}
                <div className="bg-white dark:bg-card border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Material de Consumo
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {formatCurrencyBRL(materialsTotal)}
                    </span>
                  </div>
                  <ExpenseList
                    expenses={expenses.filter(
                      (e) => e.categoria === AuditCategories.MATERIAL_CONSUMO,
                    )}
                  />
                </div>

                {/* Distribution Column */}
                <div className="bg-white dark:bg-card border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Material de Distribuição
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                      {formatCurrencyBRL(distributionTotal)}
                    </span>
                  </div>
                  <ExpenseList
                    expenses={expenses.filter(
                      (e) =>
                        e.categoria === AuditCategories.DISTRIBUICAO_GRATUITA,
                    )}
                  />
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

const ExpenseList = ({ expenses }: { expenses: any[] }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-xs text-muted-foreground/50 italic py-2 text-center">
        Nenhum item registrado
      </div>
    )
  }
  return (
    <ul className="space-y-2">
      {expenses.map((expense) => (
        <li key={expense.id} className="flex justify-between items-start gap-2">
          <span className="text-xs text-foreground line-clamp-2 leading-tight">
            {expense.descricao}
          </span>
          <span className="text-xs font-medium italic text-muted-foreground whitespace-nowrap">
            {formatCurrencyBRL(expense.valor)}
          </span>
        </li>
      ))}
    </ul>
  )
}
