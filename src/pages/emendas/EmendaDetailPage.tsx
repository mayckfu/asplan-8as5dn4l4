import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Loader2, AlertTriangle } from 'lucide-react'
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
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { getSignedUrl } from '@/lib/supabase/storage'

const EmendaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('repasses')
  const [emendaData, setEmendaData] = useState<DetailedAmendment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dadosTecnicosRef = useRef<EmendaDadosTecnicosHandles>(null)
  const repassesTabRef = useRef<EmendaRepassesTabHandles>(null)
  const despesasTabRef = useRef<EmendaDespesasTabHandles>(null)
  const anexosTabRef = useRef<HTMLDivElement>(null)

  const isReadOnly = user?.role === 'CONSULTA'

  const calculatePendencies = useCallback(
    (emenda: DetailedAmendment): Pendencia[] => {
      const pendencias: Pendencia[] = []
      const addPendencia = (
        idSuffix: string,
        descricao: string,
        isResolved: boolean,
        targetType: 'field' | 'tab',
        targetId: string,
      ) => {
        pendencias.push({
          id: `p-${emenda.id}-${idSuffix}`,
          descricao,
          dispensada: false,
          resolvida: isResolved,
          targetType,
          targetId,
        })
      }

      // 1. Portaria
      const hasPortaria =
        !!emenda.portaria || emenda.anexos.some((a) => a.tipo === 'PORTARIA')
      addPendencia(
        'portaria',
        'Portaria (Campo ou Anexo)',
        hasPortaria,
        'field',
        'portaria',
      )

      // 2. Proposta
      const hasProposta = emenda.anexos.some((a) => a.tipo === 'PROPOSTA')
      addPendencia('proposta', 'Proposta (Anexo)', hasProposta, 'tab', 'anexos')

      // 3. CIE ou Deliberação
      const hasCie =
        !!emenda.deliberacao_cie ||
        emenda.anexos.some((a) => a.tipo === 'DELIBERACAO_CIE')
      addPendencia(
        'cie',
        'CIE ou Deliberação (Campo ou Anexo)',
        hasCie,
        'field',
        'deliberacao_cie',
      )

      // 4. Ofício de Envio
      const hasOficio = emenda.anexos.some((a) => a.tipo === 'OFICIO')
      addPendencia(
        'oficio',
        'Ofício de Envio (Anexo)',
        hasOficio,
        'tab',
        'anexos',
      )

      // 5. Natureza
      addPendencia(
        'natureza',
        'Natureza',
        !!emenda.natureza,
        'field',
        'natureza',
      )

      // 6. Objeto
      addPendencia(
        'objeto',
        'Objeto',
        !!emenda.objeto_emenda,
        'field',
        'objeto_emenda',
      )

      // 7. Destino do Recurso
      addPendencia(
        'destino',
        'Destino do Recurso / Responsável',
        !!emenda.destino_recurso,
        'field',
        'destino_recurso',
      )

      // 8. Valor do Repasse
      addPendencia(
        'valor_repasse',
        'Valor do Repasse',
        !!emenda.valor_repasse && emenda.valor_repasse > 0,
        'field',
        'valor_repasse',
      )

      // 9. Observações
      addPendencia(
        'observacoes',
        'Observações',
        !!emenda.observacoes,
        'field',
        'observacoes',
      )

      // 10. Objeto e Finalidade
      addPendencia(
        'finalidade',
        'Objeto e Finalidade (Descrição Completa)',
        !!emenda.descricao_completa,
        'field',
        'descricao_completa',
      )

      // 11. Meta Operacional
      addPendencia(
        'meta',
        'Meta Operacional',
        !!emenda.meta_operacional,
        'field',
        'meta_operacional',
      )

      // Extra: Despesas > Repasses
      if (emenda.total_gasto > emenda.total_repassado) {
        pendencias.push({
          id: `p-${emenda.id}-despesas-overflow`,
          descricao: 'Despesas excedem o valor repassado',
          dispensada: false,
          resolvida: false,
          targetType: 'tab',
          targetId: 'despesas',
        })
      }

      return pendencias
    },
    [],
  )

  const fetchEmendaDetails = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const { data: emenda, error: emendaError } = await supabase
        .from('emendas')
        .select('*')
        .eq('id', id)
        .single()

      if (emendaError) throw emendaError

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

      // Map despesas to include profile name
      const mappedDespesas = despesas.map((d: any) => ({
        ...d,
        registrada_por: d.profiles?.name || 'Desconhecido',
      }))

      // Map anexos to include uploader name and sign URLs
      const mappedAnexos = await Promise.all(
        anexos.map(async (a: any) => {
          let signedUrl = a.url
          // Check if it's a storage path (not http)
          if (!a.url.startsWith('http')) {
            const signed = await getSignedUrl(a.url)
            if (signed) signedUrl = signed
          }
          return {
            ...a,
            url: signedUrl,
            uploader: a.profiles?.name || 'Desconhecido',
          }
        }),
      )

      // Map historico
      const mappedHistorico = historico.map((h: any) => ({
        ...h,
        feito_por: h.profiles?.name || 'Desconhecido',
      }))

      // Calculate totals
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
        pendencias: [], // Calculated below
        total_repassado: totalRepassado,
        total_gasto: totalGasto,
      }

      const calculatedPendencies = calculatePendencies(detailedEmenda)
      setEmendaData({ ...detailedEmenda, pendencias: calculatedPendencies })
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
  }, [id, toast, calculatePendencies])

  useEffect(() => {
    fetchEmendaDetails()
  }, [fetchEmendaDetails])

  const handleEmendaDataChange = async (updatedEmenda: DetailedAmendment) => {
    if (isReadOnly || !emendaData) return

    try {
      // Update main emenda table
      const { error } = await supabase
        .from('emendas')
        .update({
          numero_proposta: updatedEmenda.numero_proposta,
          numero_emenda: updatedEmenda.numero_emenda,
          natureza: updatedEmenda.natureza,
          objeto_emenda: updatedEmenda.objeto_emenda,
          meta_operacional: updatedEmenda.meta_operacional,
          destino_recurso: updatedEmenda.destino_recurso,
          data_repasse: updatedEmenda.data_repasse,
          valor_repasse: updatedEmenda.valor_repasse,
          portaria: updatedEmenda.portaria,
          deliberacao_cie: updatedEmenda.deliberacao_cie,
          situacao_recurso: updatedEmenda.situacao_recurso,
          observacoes: updatedEmenda.observacoes,
          descricao_completa: updatedEmenda.descricao_completa,
          situacao: updatedEmenda.situacao,
          status_interno: updatedEmenda.status_interno,
        })
        .eq('id', emendaData.id)

      if (error) throw error

      const newPendencies = calculatePendencies(updatedEmenda)
      setEmendaData({ ...updatedEmenda, pendencias: newPendencies })
      toast({ title: 'Dados atualizados com sucesso!' })
    } catch (error: any) {
      console.error('Error updating emenda:', error)
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleFinalidadeChange = (newDescription: string) => {
    if (isReadOnly || !emendaData) return
    handleEmendaDataChange({
      ...emendaData,
      descricao_completa: newDescription,
    })
  }

  const handleAddRepasse = async (repasse: Repasse) => {
    try {
      const { data, error } = await supabase
        .from('repasses')
        .insert([{ ...repasse, emenda_id: id, id: undefined }])
        .select()
        .single()

      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        const newRepasses = [...prev.repasses, data as Repasse]
        const totalRepassado = newRepasses.reduce(
          (sum, r) => (r.status === 'REPASSADO' ? sum + Number(r.valor) : sum),
          0,
        )
        return {
          ...prev,
          repasses: newRepasses,
          total_repassado: totalRepassado,
        }
      })
      toast({ title: 'Repasse adicionado com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar repasse',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleUpdateRepasse = async (repasse: Repasse) => {
    try {
      const { error } = await supabase
        .from('repasses')
        .update({
          data: repasse.data,
          valor: repasse.valor,
          fonte: repasse.fonte,
          status: repasse.status,
          observacoes: repasse.observacoes,
        })
        .eq('id', repasse.id)

      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        const newRepasses = prev.repasses.map((r) =>
          r.id === repasse.id ? repasse : r,
        )
        const totalRepassado = newRepasses.reduce(
          (sum, r) => (r.status === 'REPASSADO' ? sum + Number(r.valor) : sum),
          0,
        )
        return {
          ...prev,
          repasses: newRepasses,
          total_repassado: totalRepassado,
        }
      })
      toast({ title: 'Repasse atualizado com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar repasse',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteRepasse = async (repasseId: string) => {
    try {
      const { error } = await supabase
        .from('repasses')
        .delete()
        .eq('id', repasseId)
      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        const newRepasses = prev.repasses.filter((r) => r.id !== repasseId)
        const totalRepassado = newRepasses.reduce(
          (sum, r) => (r.status === 'REPASSADO' ? sum + Number(r.valor) : sum),
          0,
        )
        return {
          ...prev,
          repasses: newRepasses,
          total_repassado: totalRepassado,
        }
      })
      toast({ title: 'Repasse excluído com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir repasse',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleAddDespesa = async (despesa: Despesa) => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .insert([
          {
            ...despesa,
            emenda_id: id,
            id: undefined,
            registrada_por: user?.id,
          },
        ])
        .select('*, profiles:registrada_por(name)')
        .single()

      if (error) throw error

      const newDespesa = {
        ...data,
        registrada_por: data.profiles?.name || 'Usuário',
      }

      setEmendaData((prev) => {
        if (!prev) return null
        const newDespesas = [...prev.despesas, newDespesa as Despesa]
        const totalGasto = newDespesas.reduce(
          (sum, d) => sum + Number(d.valor),
          0,
        )
        return { ...prev, despesas: newDespesas, total_gasto: totalGasto }
      })
      toast({ title: 'Despesa adicionada com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar despesa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleUpdateDespesa = async (despesa: Despesa) => {
    try {
      const { error } = await supabase
        .from('despesas')
        .update({
          data: despesa.data,
          valor: despesa.valor,
          categoria: despesa.categoria,
          descricao: despesa.descricao,
          fornecedor_nome: despesa.fornecedor_nome,
          unidade_destino: despesa.unidade_destino,
          status_execucao: despesa.status_execucao,
          demanda: despesa.demanda,
        })
        .eq('id', despesa.id)

      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        const newDespesas = prev.despesas.map((d) =>
          d.id === despesa.id ? despesa : d,
        )
        const totalGasto = newDespesas.reduce(
          (sum, d) => sum + Number(d.valor),
          0,
        )
        return { ...prev, despesas: newDespesas, total_gasto: totalGasto }
      })
      toast({ title: 'Despesa atualizada com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar despesa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteDespesa = async (despesaId: string) => {
    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', despesaId)
      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        const newDespesas = prev.despesas.filter((d) => d.id !== despesaId)
        const totalGasto = newDespesas.reduce(
          (sum, d) => sum + Number(d.valor),
          0,
        )
        return { ...prev, despesas: newDespesas, total_gasto: totalGasto }
      })
      toast({ title: 'Despesa excluída com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir despesa',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleAddAnexo = async (anexo: Anexo) => {
    try {
      const { data, error } = await supabase
        .from('anexos')
        .insert([
          {
            ...anexo,
            emenda_id: id,
            id: undefined,
            uploader: user?.id,
          },
        ])
        .select('*, profiles:uploader(name)')
        .single()

      if (error) throw error

      const newAnexo = { ...data, uploader: data.profiles?.name || 'Usuário' }

      setEmendaData((prev) => {
        if (!prev) return null
        return { ...prev, anexos: [...prev.anexos, newAnexo as Anexo] }
      })
      toast({ title: 'Anexo adicionado com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar anexo',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleUpdateAnexo = async (anexo: Anexo) => {
    try {
      const { error } = await supabase
        .from('anexos')
        .update({
          titulo: anexo.titulo,
          url: anexo.url,
          tipo: anexo.tipo,
          data_documento: anexo.data,
        })
        .eq('id', anexo.id)

      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        return {
          ...prev,
          anexos: prev.anexos.map((a) => (a.id === anexo.id ? anexo : a)),
        }
      })
      toast({ title: 'Anexo atualizado com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar anexo',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAnexo = async (anexoId: string) => {
    try {
      const { error } = await supabase.from('anexos').delete().eq('id', anexoId)
      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        return { ...prev, anexos: prev.anexos.filter((a) => a.id !== anexoId) }
      })
      toast({ title: 'Anexo excluído com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir anexo',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleStatusInternoChange = (newStatus: StatusInternoEnum) => {
    if (isReadOnly || !emendaData) return
    handleEmendaDataChange({
      ...emendaData,
      status_interno: newStatus,
    })
  }

  const handleStatusOficialChange = (newStatus: SituacaoOficialEnum) => {
    if (isReadOnly || !emendaData) return
    handleEmendaDataChange({
      ...emendaData,
      situacao: newStatus,
    })
  }

  const handlePendencyClick = (pendencia: Pendencia) => {
    if (pendencia.targetType === 'field') {
      if (pendencia.targetId === 'descricao_completa') {
        const element = document.getElementById('objeto-finalidade-section')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } else {
        dadosTecnicosRef.current?.triggerEditAndFocus(pendencia.targetId)
      }
    } else if (pendencia.targetType === 'tab') {
      setActiveTab(pendencia.targetId)
      setTimeout(() => {
        switch (pendencia.targetId) {
          case 'repasses':
            repassesTabRef.current?.triggerAdd()
            break
          case 'despesas':
            despesasTabRef.current?.triggerAdd()
            break
          case 'anexos':
            anexosTabRef.current?.scrollIntoView({ behavior: 'smooth' })
            break
        }
      }, 100)
    }
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
        <p className="text-muted-foreground">
          {error || `A emenda com o ID "${id}" não foi encontrada.`}
        </p>
        <Button onClick={() => navigate('/emendas')}>
          Voltar para a lista
        </Button>
      </div>
    )
  }

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
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Detalhes da Emenda
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Gerar Dossiê
          </Button>
        </div>
      </div>

      <EmendaDetailHeader
        emenda={emendaData}
        onStatusOficialChange={handleStatusOficialChange}
        onStatusInternoChange={handleStatusInternoChange}
      />

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <EmendaDadosTecnicos
            ref={dadosTecnicosRef}
            emenda={emendaData}
            onEmendaChange={handleEmendaDataChange}
          />
          <div id="objeto-finalidade-section">
            <EmendaObjetoFinalidade
              description={emendaData.descricao_completa}
              onSave={handleFinalidadeChange}
            />
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="repasses"
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="repasses">Repasses</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="repasses" className="mt-4">
          <EmendaRepassesTab
            ref={repassesTabRef}
            repasses={emendaData.repasses}
            onRepassesChange={(repasses) => {
              const oldRepasses = emendaData.repasses
              if (repasses.length > oldRepasses.length) {
                const newRepasse = repasses.find(
                  (r) => !oldRepasses.find((or) => or.id === r.id),
                )
                if (newRepasse) handleAddRepasse(newRepasse)
              } else if (repasses.length < oldRepasses.length) {
                const deletedRepasse = oldRepasses.find(
                  (or) => !repasses.find((r) => r.id === or.id),
                )
                if (deletedRepasse) handleDeleteRepasse(deletedRepasse.id)
              } else {
                const changedRepasse = repasses.find((r) => {
                  const old = oldRepasses.find((or) => or.id === r.id)
                  return JSON.stringify(old) !== JSON.stringify(r)
                })
                if (changedRepasse) handleUpdateRepasse(changedRepasse)
              }
            }}
          />
        </TabsContent>
        <TabsContent value="despesas" className="mt-4">
          <EmendaDespesasTab
            ref={despesasTabRef}
            despesas={emendaData.despesas}
            onDespesasChange={(despesas) => {
              const oldDespesas = emendaData.despesas
              if (despesas.length > oldDespesas.length) {
                const newDespesa = despesas.find(
                  (d) => !oldDespesas.find((od) => od.id === d.id),
                )
                if (newDespesa) handleAddDespesa(newDespesa)
              } else if (despesas.length < oldDespesas.length) {
                const deletedDespesa = oldDespesas.find(
                  (od) => !despesas.find((d) => d.id === od.id),
                )
                if (deletedDespesa) handleDeleteDespesa(deletedDespesa.id)
              } else {
                const changedDespesa = despesas.find((d) => {
                  const old = oldDespesas.find((od) => od.id === d.id)
                  return JSON.stringify(old) !== JSON.stringify(d)
                })
                if (changedDespesa) handleUpdateDespesa(changedDespesa)
              }
            }}
          />
        </TabsContent>
        <TabsContent value="anexos" className="mt-4">
          <div ref={anexosTabRef}>
            <EmendaAnexosTab
              anexos={emendaData.anexos}
              onAnexosChange={(anexos) => {
                const oldAnexos = emendaData.anexos
                if (anexos.length > oldAnexos.length) {
                  const newAnexo = anexos.find(
                    (a) => !oldAnexos.find((oa) => oa.id === a.id),
                  )
                  if (newAnexo) handleAddAnexo(newAnexo)
                } else if (anexos.length < oldAnexos.length) {
                  const deletedAnexo = oldAnexos.find(
                    (oa) => !anexos.find((a) => a.id === oa.id),
                  )
                  if (deletedAnexo) handleDeleteAnexo(deletedAnexo.id)
                } else {
                  const changedAnexo = anexos.find((a) => {
                    const old = oldAnexos.find((oa) => oa.id === a.id)
                    return JSON.stringify(old) !== JSON.stringify(a)
                  })
                  if (changedAnexo) handleUpdateAnexo(changedAnexo)
                }
              }}
            />
          </div>
        </TabsContent>
        <TabsContent value="checklist" className="mt-4">
          <EmendaChecklistTab
            pendencias={emendaData.pendencias}
            onPendencyClick={handlePendencyClick}
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
