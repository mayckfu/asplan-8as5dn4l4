import { DateRange } from 'react-day-picker'
import { X } from 'lucide-react'
import { TipoRecurso, SituacaoOficial, StatusInterno } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'

export type ReportFiltersState = {
  autor: string
  tipoRecurso: string
  situacao: string
  statusInterno: string
  periodo: DateRange | undefined
  valorMin: string
  valorMax: string
  responsavel: string
  unidade: string
  demanda: string
  statusExecucao: string
  fornecedor: string
}

interface ReportsFiltersProps {
  filters: ReportFiltersState
  onFilterChange: (newFilters: Partial<ReportFiltersState>) => void
  onReset: () => void
}

export const ReportsFilters = ({
  filters,
  onFilterChange,
  onReset,
}: ReportsFiltersProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ [e.target.name]: e.target.value })
  }
  const handleSelectChange = (name: string) => (value: string) => {
    onFilterChange({ [name]: value })
  }
  const handleDateChange = (date: DateRange | undefined) => {
    onFilterChange({ periodo: date })
  }

  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Filtrar por Autor..."
          name="autor"
          value={filters.autor}
          onChange={handleInputChange}
        />
        <Select
          value={filters.tipoRecurso}
          onValueChange={handleSelectChange('tipoRecurso')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Recurso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(TipoRecurso).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.situacao}
          onValueChange={handleSelectChange('situacao')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Situação Oficial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(SituacaoOficial).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.statusInterno}
          onValueChange={handleSelectChange('statusInterno')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status Interno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(StatusInterno).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker
          date={filters.periodo}
          onDateChange={handleDateChange}
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Valor Mín."
            name="valorMin"
            value={filters.valorMin}
            onChange={handleInputChange}
          />
          <Input
            type="number"
            placeholder="Valor Máx."
            name="valorMax"
            value={filters.valorMax}
            onChange={handleInputChange}
          />
        </div>
        <Input
          placeholder="Filtrar por Responsável..."
          name="responsavel"
          value={filters.responsavel}
          onChange={handleInputChange}
        />
        <Input
          placeholder="Filtrar por Unidade..."
          name="unidade"
          value={filters.unidade}
          onChange={handleInputChange}
        />
        <Input
          placeholder="Filtrar por Demanda..."
          name="demanda"
          value={filters.demanda}
          onChange={handleInputChange}
        />
        <Select
          value={filters.statusExecucao}
          onValueChange={handleSelectChange('statusExecucao')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status de Execução" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PLANEJADA">Planejada</SelectItem>
            <SelectItem value="EMPENHADA">Empenhada</SelectItem>
            <SelectItem value="LIQUIDADA">Liquidada</SelectItem>
            <SelectItem value="PAGA">Paga</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Filtrar por Fornecedor..."
          name="fornecedor"
          value={filters.fornecedor}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onReset}>
          <X className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      </div>
    </div>
  )
}
