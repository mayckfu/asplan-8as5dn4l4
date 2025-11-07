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
        <h3 className="text-lg font-semibold text-neutral-800">
          Mapeamento de Colunas
        </h3>
        <p className="text-sm text-neutral-600">
          Associe as colunas do seu arquivo CSV aos campos do sistema.
        </p>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium text-neutral-800">
                Campo do Sistema
              </TableHead>
              <TableHead className="font-medium text-neutral-800">
                Coluna do CSV
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {targetFields.map((field) => (
              <TableRow key={field.key}>
                <TableCell className="font-medium text-neutral-600">
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
