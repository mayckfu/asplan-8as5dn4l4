import { useState, useEffect, useMemo } from 'react'
import {
  Printer,
  FileDown,
  Calendar as CalendarIcon,
  User as UserIcon,
  Search,
  Loader2,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrencyBRL } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { Amendment, TipoRecurso, TipoEmenda } from '@/lib/mock-data'

const QuadroEstadualPage = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Amendment[]>([])
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  )
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: emendas, error } = await supabase
          .from('emendas')
          .select('*')
          .eq('origem', 'ESTADUAL')
          .order('created_at', { ascending: false })

        if (error) throw error

        setData((emendas as Amendment[]) || [])
      } catch (error) {
        console.error('Error fetching state amendments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchYear =
        selectedYear === 'all' ||
        item.ano_exercicio.toString() === selectedYear.toString()
      const matchAuthor =
        selectedAuthor === 'all' || item.autor === selectedAuthor
      return matchYear && matchAuthor
    })
  }, [data, selectedYear, selectedAuthor])

  const totalValue = useMemo(() => {
    return filteredData.reduce((acc, item) => acc + item.valor_total, 0)
  }, [filteredData])

  const uniqueAuthors = useMemo(() => {
    const authors = Array.from(new Set(data.map((item) => item.autor))).filter(
      Boolean,
    )
    return authors.sort()
  }, [data])

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // Using browser native print-to-pdf functionality which is standard for modern web apps
    // unless a specific complex PDF generation is required.
    window.print()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-asplan-deep">
            Quadro Estadual
          </h1>
          <p className="text-muted-foreground mt-1">
            Quadro Demonstrativo dos Recursos - Emendas Estaduais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={handleExportPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Printable Header - Visible only on print */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold text-center text-black mb-2">
          Quadro Demonstrativo dos Recursos - Emendas Estaduais
        </h1>
        <p className="text-center text-sm text-gray-600">
          Gerado em {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Filters and Summary */}
      <div className="grid gap-6 md:grid-cols-[300px_1fr] print:block">
        <Card className="print:hidden h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" /> Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Exercício
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Array.from({ length: 5 }, (_, i) =>
                    (new Date().getFullYear() - i).toString(),
                  ).map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                Autor
              </label>
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o autor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueAuthors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-brand-50 to-white border-brand-100 shadow-sm print:shadow-none print:border-black print:mb-4">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-600 uppercase tracking-wide">
                  Sub Total (Valor Total)
                </p>
                <h2 className="text-3xl font-bold text-brand-900 mt-1 tabular-nums">
                  {formatCurrencyBRL(totalValue)}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredData.length} registros encontrados
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center print:hidden">
                <Wallet className="h-6 w-6 text-brand-600" />
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="print:shadow-none print:border-none">
            <CardContent className="p-0">
              <div className="rounded-md border print:border-black">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 print:bg-gray-100">
                      <TableHead className="font-semibold text-brand-900 print:text-black">
                        Autor
                      </TableHead>
                      <TableHead className="font-semibold text-brand-900 print:text-black">
                        Nº Proposta
                      </TableHead>
                      <TableHead className="font-semibold text-brand-900 print:text-black">
                        Tipo de Recurso
                      </TableHead>
                      <TableHead className="font-semibold text-brand-900 print:text-black">
                        Tipo (Objeto)
                      </TableHead>
                      <TableHead className="font-semibold text-brand-900 text-right print:text-black">
                        Valor (R$)
                      </TableHead>
                      <TableHead className="font-semibold text-brand-900 print:text-black">
                        Portaria
                      </TableHead>
                      <TableHead className="font-semibold text-brand-900 print:text-black w-[250px]">
                        Descrição Resumida
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span>Carregando dados...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Nenhum registro encontrado para os filtros
                          selecionados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item) => (
                        <TableRow
                          key={item.id}
                          className="print:border-b-black"
                        >
                          <TableCell className="font-medium">
                            {item.autor}
                          </TableCell>
                          <TableCell>{item.numero_proposta || '—'}</TableCell>
                          <TableCell>
                            {TipoRecurso[item.tipo_recurso] ||
                              item.tipo_recurso}
                          </TableCell>
                          <TableCell className="capitalize">
                            {item.objeto_emenda ||
                              item.meta_operacional ||
                              TipoEmenda[item.tipo]}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatCurrencyBRL(item.valor_total)}
                          </TableCell>
                          <TableCell>{item.portaria || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground print:text-black">
                            <span className="line-clamp-2 print:line-clamp-none">
                              {item.descricao_completa ||
                                item.observacoes ||
                                '—'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default QuadroEstadualPage
