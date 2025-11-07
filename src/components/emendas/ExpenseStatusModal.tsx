import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Despesa } from '@/lib/mock-data'

interface ExpenseStatusModalProps {
  expense: Despesa | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

const statusOptions: Despesa['status_execucao'][] = [
  'PLANEJADA',
  'EMPENHADA',
  'LIQUIDADA',
  'PAGA',
]

export const ExpenseStatusModal = ({
  expense,
  isOpen,
  onOpenChange,
}: ExpenseStatusModalProps) => {
  if (!expense) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-neutral-800">
            Alterar Status da Despesa
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4 text-neutral-600">
          <p>
            Despesa:{' '}
            <span className="font-semibold text-neutral-800">
              {expense.descricao}
            </span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="status-select">Novo Status</Label>
            <Select defaultValue={expense.status_execucao}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
