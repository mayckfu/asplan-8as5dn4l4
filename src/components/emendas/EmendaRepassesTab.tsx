import { useState } from 'react'
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Repasse } from '@/lib/mock-data'
import { formatCurrencyBRL } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface EmendaRepassesTabProps {
  repasses: Repasse[]
}

export const EmendaRepassesTab = ({ repasses }: EmendaRepassesTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRepasse, setSelectedRepasse] = useState<Repasse | null>(null)

  const sortedRepasses = [...repasses].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  )

  const handleEdit = (repasse: Repasse) => {
    setSelectedRepasse(repasse)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setSelectedRepasse(null)
    setIsDialogOpen(true)
  }

  return (
    <Card className="rounded-2xl shadow-sm border border-neutral-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-medium text-neutral-800">
            Repasses Financeiros
          </CardTitle>
          <Button size="sm" onClick={handleAddNew}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Repasse
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 bg-card/90 backdrop-blur-sm z-10">
                <TableHead className="font-medium text-neutral-800">
                  Data
                </TableHead>
                <TableHead className="font-medium text-neutral-800">
                  Fonte
                </TableHead>
                <TableHead className="text-right font-medium text-neutral-800">
                  Valor
                </TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRepasses.map((repasse) => (
                <TableRow
                  key={repasse.id}
                  className="h-10 py-2 text-neutral-600 odd:bg-white even:bg-neutral-50 hover:bg-neutral-100 dark:odd:bg-card dark:even:bg-muted/50 dark:hover:bg-muted"
                >
                  <TableCell>
                    {new Date(repasse.data).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{repasse.fonte}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrencyBRL(repasse.valor)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleEdit(repasse)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mais ações</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRepasse ? 'Editar Repasse' : 'Adicionar Repasse'}
              </DialogTitle>
            </DialogHeader>
            <p>Formulário de repasse aqui.</p>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
