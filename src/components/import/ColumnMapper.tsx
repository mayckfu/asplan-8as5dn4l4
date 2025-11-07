import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface ColumnMapperProps {
  headers: string[]
  targetFields: { key: string; label: string; required: boolean }[]
  onMappingChange: (mapping: Record<string, string>) => void
  onConfirm: () => void
  onCancel: () => void
}

export const ColumnMapper = ({
  headers,
  targetFields,
  onMappingChange,
  onConfirm,
  onCancel,
}: ColumnMapperProps) => {
  const handleSelectChange = (targetKey: string, csvHeader: string) => {
    onMappingChange({ [targetKey]: csvHeader })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200">
          Mapeamento de Colunas
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Associe as colunas do seu arquivo CSV aos campos do sistema.
        </p>
      </div>
      <div className="border rounded-md relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 bg-background/90 backdrop-blur-sm z-10">
              <TableHead className="font-medium text-neutral-900 dark:text-neutral-200">
                Campo do Sistema
              </TableHead>
              <TableHead className="font-medium text-neutral-900 dark:text-neutral-200">
                Coluna do CSV
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {targetFields.map((field) => (
              <TableRow
                key={field.key}
                className="h-10 py-2 odd:bg-white even:bg-neutral-50 hover:bg-neutral-100 dark:odd:bg-card dark:even:bg-muted/50 dark:hover:bg-muted"
              >
                <TableCell className="font-medium text-neutral-600 dark:text-neutral-400">
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange(field.key, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="--ignore--">-- Ignorar --</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onConfirm}>Confirmar e Importar</Button>
      </div>
    </div>
  )
}
