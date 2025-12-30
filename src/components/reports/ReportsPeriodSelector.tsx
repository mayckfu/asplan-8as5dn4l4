import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

interface ReportsPeriodSelectorProps {
  year: string
  month: string
  onYearChange: (year: string) => void
  onMonthChange: (month: string) => void
  className?: string
}

export function ReportsPeriodSelector({
  year,
  month,
  onYearChange,
  onMonthChange,
  className,
}: ReportsPeriodSelectorProps) {
  const currentYear = new Date().getFullYear()
  const years = [
    (currentYear - 1).toString(),
    currentYear.toString(),
    (currentYear + 1).toString(),
  ]
  const months = [
    { value: 'all', label: 'Todos os Meses' },
    { value: '0', label: 'Janeiro' },
    { value: '1', label: 'Fevereiro' },
    { value: '2', label: 'Março' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Maio' },
    { value: '5', label: 'Junho' },
    { value: '6', label: 'Julho' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Setembro' },
    { value: '9', label: 'Outubro' },
    { value: '10', label: 'Novembro' },
    { value: '11', label: 'Dezembro' },
  ]

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row gap-3 items-start sm:items-center',
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-lg border border-border/40 shadow-sm">
        <CalendarDays className="h-4 w-4 text-muted-foreground ml-2 mr-1" />
        <ToggleGroup
          type="single"
          value={year}
          onValueChange={(val) => val && onYearChange(val)}
        >
          {years.map((y) => (
            <ToggleGroupItem
              key={y}
              value={y}
              className="h-7 px-4 text-xs font-medium data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:shadow-sm rounded-md transition-all hover:bg-background/50"
            >
              {y}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Select value={month} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[180px] h-[42px] bg-muted/40 border-border/40 shadow-sm hover:bg-background/50 transition-colors">
          <SelectValue placeholder="Selecione o Mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
