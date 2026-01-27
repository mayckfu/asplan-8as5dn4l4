import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertTriangle,
  ListChecks,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DetailedAmendment,
  Despesa,
  Anexo,
  Pendencia,
  Repasse,
  StatusInternoEnum,
  SituacaoOficialEnum,
  Historico,
  ActionWithDestinations,
} from '@/lib/mock-data'
import { EmendaDetailHeader } from '@/components/emendas/EmendaDetailHeader'
import {
  EmendaDadosTecnicos,
  EmendaDadosTecnicosHandles,
} from '@/components/emendas/EmendaDadosTecnicos'
import { EmendaObjetoFinalidade } from '@/components/emendas/EmendaObjetoFinalidade'
import {
  EmendaRepassesTab,
  EmendaRepassesTabHandles,
} from '@/components/emendas/EmendaRepassesTab'
import {
  EmendaDespesasTab,
  EmendaDespesasTabHandles,
} from '@/components/emendas/EmendaDespesasTab'
import { EmendaAnexosTab } from '@/components/emendas/EmendaAnexosTab'
import { EmendaChecklistTab } from '@/components/emendas/EmendaChecklistTab'
import { EmendaHistoricoTab } from '@/components/emendas/EmendaHistoricoTab'
import { EmendaPlanejamentoTab } from '@/components/emendas/EmendaPlanejamentoTab'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { getSignedUrl, deleteFile } from '@/lib/supabase/storage'

const EmendaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, checkPermission } = useAuth()
  const [activeTab, setActiveTab] = useState('planning')
  const [emendaData, setEmendaData] = useState<DetailedAmendment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dadosTecnicosRef = useRef<EmendaDadosTecnicosHandles>(null)
  const repassesTabRef = useRef<EmendaRepassesTabHandles>(null)
  const despesasTabRef = useRef<EmendaDespesasTabHandles>(null)
  const anexosTabRef = useRef<HTMLDivElement>(null)

  const canEdit = checkPermission(['ADMIN', 'GESTOR', 'ANALISTA'])

  const fetchEmendaDetails = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      // Fetch core emenda
      const { data: emenda, error: emendaError } = await supabase
        .from('emendas')
        .select('*')
        .eq('id', id)
        .single()
      if (emendaError) throw emendaError

      // Fetch related data
      const { data: repasses, error: repassesError } = await supabase
        .from('repasses')
        .select('*')
        .eq('emenda_id', id)
      if (repassesError) throw repassesError

      const { data: despesas, error: despesasError } = await supabase
        .from('despesas')
        .select('*, profiles:registrada_por(name)')
        .eq('emenda_id', id)
      if (despesasError) throw despesasError

      const { data: anexos, error: anexosError } = await supabase
        .from('anexos')
        .select('*, profiles:uploader(name)')
        .eq('emenda_id', id)
      if (anexosError) throw anexosError

      const { data: historico, error: historicoError } = await supabase
        .from('historico')
        .select('*, profiles:feito_por(name)')
        .eq('emenda_id', id)
        .order('criado_em', { ascending: false })
      if (historicoError) throw historicoError

      const { data: pendenciasData, error: pendenciasError } = await supabase
        .from('pendencias')
        .select('*')
        .eq('emenda_id', id)
      if (pendenciasError) throw pendenciasError

      // Fetch Actions & Destinations
      const { data: acoes, error: acoesError } = await supabase
        .from('acoes_emendas')
        .select('*')
        .eq('emenda_id', id)
      if (acoesError) throw acoesError

      const acaoIds = acoes.map((a: any) => a.id)
      let destinacoes: any[] = []
      if (acaoIds.length > 0) {
        const { data: dests, error: destError } = await supabase
          .from('destinacoes_recursos')
          .select('*')
          .in('acao_id', acaoIds)
        if (destError) throw destError
        destinacoes = dests
      }

      const mappedAcoes: ActionWithDestinations[] = acoes.map((a: any) => ({
        ...a,
        destinacoes: destinacoes.filter((d: any) => d.acao_id === a.id),
      }))

      // Map other entities
      const mappedDespesas = despesas.map((d: any) => ({
        ...d,
        registrada_por: d.profiles?.name || 'Desconhecido',
      }))

      const mappedAnexos = await Promise.all(
        anexos.map(async (a: any) => {
          let signedUrl = a.url
          if (!a.url.startsWith('http')) {
            const signed = await getSignedUrl(a.url)
            if (signed) signedUrl = signed
          }
          return {
            ...a,
            filename: a.filename || a.titulo || 'Sem Nome',
            url: signedUrl,
            uploader: a.profiles?.name || 'Desconhecido',
          }
        }),
      )

      const mappedHistorico = historico.map((h: any) => ({
        ...h,
        feito_por: h.profiles?.name || 'Desconhecido',
      }))

      const mappedPendencias: Pendencia[] = pendenciasData.map((p: any) => ({
        id: p.id,
        descricao: p.descricao,
        dispensada: p.dispensada,
        resolvida: p.resolvida,
        justificativa: p.justificativa,
        targetType: p.target_type,
        targetId: p.target_id,
      }))

      const totalRepassado = repasses.reduce(
        (sum: number, r: any) =>
          r.status === 'REPASSADO' ? sum + Number(r.valor) : sum,
        0,
      )
      const totalGasto = mappedDespesas.reduce(
        (sum: number, d: any) => sum + Number(d.valor),
        0,
      )

      const detailedEmenda: DetailedAmendment = {
        ...emenda,
        repasses: repasses as Repasse[],
        despesas: mappedDespesas as Despesa[],
        anexos: mappedAnexos as Anexo[],
        historico: mappedHistorico as Historico[],
        pendencias: mappedPendencias,
        acoes: mappedAcoes,
        total_repassado: totalRepassado,
        total_gasto: totalGasto,
      }

      setEmendaData(detailedEmenda)
    } catch (error: any) {
      console.error('Error fetching emenda details:', error)
      setError(error.message || 'Erro ao carregar detalhes.')
      toast({
        title: 'Erro ao carregar detalhes',
        description: 'Não foi possível carregar os dados da emenda.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    fetchEmendaDetails()
  }, [fetchEmendaDetails])

  const refreshData = async () => {
    await fetchEmendaDetails()
  }

  const handleEmendaDataChange = async (updatedEmenda: DetailedAmendment) => {
    if (!canEdit || !emendaData) return
    try {
      const { error } = await supabase
        .from('emendas')
        .update({
          // Only allow updating certain fields through this handler
          natureza: updatedEmenda.natureza,
          objeto_emenda: updatedEmenda.objeto_emenda,
          meta_operacional: updatedEmenda.meta_operacional,
          destino_recurso: updatedEmenda.destino_recurso,
          data_repasse: updatedEmenda.data_repasse,
          valor_repasse: updatedEmenda.valor_repasse,
          portaria: updatedEmenda.portaria,
          deliberacao_cie: updatedEmenda.deliberacao_cie,
          observacoes: updatedEmenda.observacoes,
          descricao_completa: updatedEmenda.descricao_completa,
          situacao: updatedEmenda.situacao,
          status_interno: updatedEmenda.status_interno,
        })
        .eq('id', emendaData.id)

      if (error) throw error
      setEmendaData(updatedEmenda)
      toast({ title: 'Dados atualizados com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleStatusInternoChange = (newStatus: StatusInternoEnum) => {
    if (!canEdit || !emendaData) return
    handleEmendaDataChange({ ...emendaData, status_interno: newStatus })
  }

  const handleStatusOficialChange = (newStatus: SituacaoOficialEnum) => {
    if (!canEdit || !emendaData) return
    handleEmendaDataChange({ ...emendaData, situacao: newStatus })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !emendaData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">
          {error || 'Emenda não encontrada'}
        </h2>
        <Button onClick={() => navigate('/emendas')}>
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const destinationsForDropdown = emendaData.acoes.map((action) => ({
    actionName: action.nome_acao,
    items: action.destinacoes,
  }))

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
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Detalhes da Emenda
        </h1>
      </div>

      <EmendaDetailHeader
        emenda={emendaData}
        onStatusOficialChange={handleStatusOficialChange}
        onStatusInternoChange={handleStatusInternoChange}
      />

      <div className="space-y-6">
        <EmendaDadosTecnicos
          ref={dadosTecnicosRef}
          emenda={emendaData}
          onEmendaChange={handleEmendaDataChange}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="planning"
        className="w-full"
      >
        <div className="w-full overflow-x-auto pb-2 scrollbar-none">
          <TabsList className="inline-flex w-full min-w-max md:w-full md:grid md:grid-cols-6 p-1 h-auto">
            <TabsTrigger value="planning" className="px-4 py-2 gap-2">
              <ListChecks className="h-4 w-4" />
              Ações e Planejamento
            </TabsTrigger>
            <TabsTrigger value="repasses" className="px-4 py-2">
              Repasses
            </TabsTrigger>
            <TabsTrigger value="despesas" className="px-4 py-2">
              Despesas
            </TabsTrigger>
            <TabsTrigger value="anexos" className="px-4 py-2">
              Anexos
            </TabsTrigger>
            <TabsTrigger value="checklist" className="px-4 py-2">
              Checklist
            </TabsTrigger>
            <TabsTrigger value="historico" className="px-4 py-2">
              Histórico
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="planning" className="mt-4">
          <EmendaPlanejamentoTab emenda={emendaData} onUpdate={refreshData} />
        </TabsContent>

        <TabsContent value="repasses" className="mt-4">
          <EmendaRepassesTab
            ref={repassesTabRef}
            repasses={emendaData.repasses}
            onRepassesChange={() => refreshData()}
          />
        </TabsContent>
        <TabsContent value="despesas" className="mt-4">
          <EmendaDespesasTab
            ref={despesasTabRef}
            despesas={emendaData.despesas}
            destinations={destinationsForDropdown}
            onDespesasChange={() => refreshData()}
          />
        </TabsContent>
        <TabsContent value="anexos" className="mt-4">
          <div ref={anexosTabRef}>
            <EmendaAnexosTab
              anexos={emendaData.anexos}
              onAnexosChange={() => refreshData()}
            />
          </div>
        </TabsContent>
        <TabsContent value="checklist" className="mt-4">
          <EmendaChecklistTab
            pendencias={emendaData.pendencias}
            onPendencyClick={() => {}}
            onDismiss={() => {}}
          />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <EmendaHistoricoTab historico={emendaData.historico} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EmendaDetailPage
