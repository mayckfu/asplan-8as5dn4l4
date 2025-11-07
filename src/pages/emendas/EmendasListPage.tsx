import { useState, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  PlusCircle,
  MoreHorizontal,
  FileDown,
  ListFilter,
  Save,
} from 'lucide-react'
import { parse, format } from 'date-fns'
import { amendments, Amendment } from '@/lib/mock-data'
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  EmendasFilters,
  FiltersState,
} from '@/components/emendas/EmendasFilters'
import { DateRange } from 'react-day-picker'

const ITEMS_PER_PAGE = 10

const getPendencias = (amendment: Amendment) => {
  const pendencias: string[] = []
  if (!amendment.portaria) pendencias.push('Falta Portaria')
  if (!amendment.deliberacao_cie) pendencias.push('Falta CIE')
  if (!amendment.anexos_essenciais) pendencias.push('Sem Anexos Essenciais')
  if (amendment.total_repassado <= 0) pendencias.push('Sem Repasses')
  if (amendment.total_gasto > amendment.total_repassado)
    pendencias.push('Despesas > Repasses')
  return pendencias
}

const EmendasListPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [presets, setPresets] = useState<Record<string, string>>(() =>
    JSON.parse(localStorage.getItem('emendas_presets') || '{}'),
  )

  const filters = useMemo<FiltersState>(() => {
    const fromStr = searchParams.get('from')
    const toStr = searchParams.get('to')
    return {
      autor: searchParams.get('autor') ?? '',
      tipoRecurso: searchParams.get('tipoRecurso') ?? 'all',
      situacaoOficial: searchParams.get('situacaoOficial') ?? 'all',
      statusInterno: searchParams.get('statusInterno') ?? 'all',
      periodo: fromStr
        ? {
            from: parse(fromStr, 'yyyy-MM-dd', new Date()),
            to: toStr ? parse(toStr, 'yyyy-MM-dd', new Date()) : undefined,
          }
        : undefined,
      valorMin: searchParams.get('valorMin') ?? '',
      valorMax: searchParams.get('valorMax') ?? '',
      comPortaria: searchParams.get('comPortaria') === 'true',
      comCIE: searchParams.get('comCIE') === 'true',
      comAnexos: searchParams.get('comAnexos') === 'true',
      apenasPendencias: searchParams.get('apenasPendencias') === 'true',
    }
  }, [searchParams])

  const currentPage = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams],
  )

  const handleFilterChange = useCallback(
    (newFilters: Partial<FiltersState>) => {
      const newParams = new URLSearchParams(searchParams)
      Object.entries(newFilters).forEach(([key, value]) => {
        if (key === 'periodo') {
          const dateRange = value as DateRange | undefined
          if (dateRange?.from) {
            newParams.set('from', format(dateRange.from, 'yyyy-MM-dd'))
            if (dateRange.to) {
              newParams.set('to', format(dateRange.to, 'yyyy-MM-dd'))
            } else {
              newParams.delete('to')
            }
          } else {
            newParams.delete('from')
            newParams.delete('to')
          }
        } else if (value === '' || value === 'all' || value === false) {
          newParams.delete(key)
        } else {
          newParams.set(key, String(value))
        }
      })
      newParams.set('page', '1')
      setSearchParams(newParams, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const handleResetFilters = useCallback(() => {
    setSearchParams({ page: '1' }, { replace: true })
  }, [setSearchParams])

  const filteredAmendments = useMemo(() => {
    return amendments
      .map((amendment) => ({
        ...amendment,
        pendencias: getPendencias(amendment),
      }))
      .filter((amendment) => {
        if (
          filters.autor &&
          !amendment.autor.toLowerCase().includes(filters.autor.toLowerCase())
        )
          return false
        if (
          filters.tipoRecurso !== 'all' &&
          amendment.tipo_recurso !== filters.tipoRecurso
        )
          return false
        if (
          filters.situacaoOficial !== 'all' &&
          amendment.situacao !== filters.situacaoOficial
        )
          return false
        if (
          filters.statusInterno !== 'all' &&
          amendment.status_interno !== filters.statusInterno
        )
          return false
        if (
          filters.valorMin &&
          amendment.valor_total < parseFloat(filters.valorMin)
        )
          return false
        if (
          filters.valorMax &&
          amendment.valor_total > parseFloat(filters.valorMax)
        )
          return false
        if (filters.periodo?.from) {
          const amendmentDate = new Date(amendment.created_at)
          if (amendmentDate < filters.periodo.from) return false
          if (filters.periodo.to && amendmentDate > filters.periodo.to)
            return false
        }
        if (filters.comPortaria && !amendment.portaria) return false
        if (filters.comCIE && !amendment.deliberacao_cie) return false
        if (filters.comAnexos && !amendment.anexos_essenciais) return false
        if (filters.apenasPendencias && amendment.pendencias.length === 0)
          return false
        return true
      })
  }, [filters])

  const totalPages = Math.ceil(filteredAmendments.length / ITEMS_PER_PAGE)
  const paginatedData = filteredAmendments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('page', String(page))
      setSearchParams(newParams, { replace: true })
    }
  }

  const savePreset = () => {
    const name = prompt('Digite um nome para a visualização:')
    if (name) {
      const newPresets = { ...presets, [name]: searchParams.toString() }
      setPresets(newPresets)
      localStorage.setItem('emendas_presets', JSON.stringify(newPresets))
    }
  }

  const applyPreset = (name: string) => {
    setSearchParams(new URLSearchParams(presets[name]), { replace: true })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lista de Emendas</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <FileDown className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Nova Emenda
            </span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Collapsible defaultOpen>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>Filtros</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Visualizações Salvas
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Carregar Visualização</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.keys(presets).map((name) => (
                      <DropdownMenuItem
                        key={name}
                        onClick={() => applyPreset(name)}
                      >
                        {name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" onClick={savePreset}>
                  <Save className="mr-2 h-4 w-4" /> Salvar Visualização
                </Button>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  <ListFilter className="h-4 w-4" />
                  <span className="sr-only">Filtros</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-4">
              <EmendasFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Nº Emenda</TableHead>
                <TableHead>Nº Proposta</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Situação Oficial</TableHead>
                <TableHead>Status Interno</TableHead>
                <TableHead>Pendências</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((amendment) => (
                <TableRow
                  key={amendment.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/emenda/${amendment.id}`)}
                >
                  <TableCell>{amendment.tipo}</TableCell>
                  <TableCell>{amendment.autor}</TableCell>
                  <TableCell>{amendment.numero_emenda}</TableCell>
                  <TableCell>{amendment.numero_proposta}</TableCell>
                  <TableCell className="text-right">
                    {amendment.valor_total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={amendment.situacao} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={amendment.status_interno} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {amendment.pendencias.map((p) => (
                        <Badge
                          key={p}
                          variant="destructive"
                          className="text-xs"
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => navigate(`/emenda/${amendment.id}`)}
                        >
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(currentPage - 1)
              }}
              className={
                currentPage === 1 ? 'pointer-events-none opacity-50' : ''
              }
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                isActive={currentPage === i + 1}
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(i + 1)
                }}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(currentPage + 1)
              }}
              className={
                currentPage >= totalPages
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default EmendasListPage
