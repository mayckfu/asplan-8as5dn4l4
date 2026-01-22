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
import { EmendaQuadroDemonstrativoTab } from '@/components/emendas/EmendaQuadroDemonstrativoTab'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { getSignedUrl, deleteFile } from '@/lib/supabase/storage'

const REQUIRED_PENDENCIES = [
  {
    id: 'portaria',
    descricao: 'Portaria (Campo ou Anexo)',
    targetType: 'field',
  },
  { id: 'proposta', descricao: 'Proposta (Anexo)', targetType: 'tab' },
  {
    id: 'cie',
    descricao: 'CIE ou Deliberação (Campo ou Anexo)',
    targetType: 'field',
  },
  { id: 'oficio', descricao: 'Ofício de Envio (Anexo)', targetType: 'tab' },
  { id: 'natureza', descricao: 'Natureza', targetType: 'field' },
  { id: 'objeto', descricao: 'Objeto', targetType: 'field' },
  {
    id: 'destino',
    descricao: 'Destino do Recurso / Responsável',
    targetType: 'field',
  },
  { id: 'valor_repasse', descricao: 'Valor do Repasse', targetType: 'field' },
  { id: 'observacoes', descricao: 'Observações', targetType: 'field' },
  {
    id: 'finalidade',
    descricao: 'Objeto e Finalidade (Descrição Completa)',
    targetType: 'field',
  },
  { id: 'meta', descricao: 'Meta Operacional', targetType: 'field' },
] as const

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

  const syncPendenciesWithDb = useCallback(async (emendaId: string) => {
    const { data: existingPendencies, error: fetchError } = await supabase
      .from('pendencias')
      .select('*')
      .eq('emenda_id', emendaId)

    if (fetchError) throw fetchError

    const missingPendencies = REQUIRED_PENDENCIES.filter(
      (req) => !existingPendencies.some((p) => p.target_id === req.id),
    )

    if (missingPendencies.length > 0) {
      const toInsert = missingPendencies.map((req) => ({
        emenda_id: emendaId,
        descricao: req.descricao,
        target_type: req.targetType,
        target_id: req.id,
        resolvida: false,
        dispensada: false,
      }))

      const { error: insertError } = await supabase
        .from('pendencias')
        .insert(toInsert)

      if (insertError) throw insertError
    }
  }, [])

  const checkAutoResolution = useCallback(async (emenda: DetailedAmendment) => {
    if (!emenda) return

    const updates: { id: string; resolvida: boolean }[] = []
    const currentPendencies = emenda.pendencias

    const getPendency = (targetId: string) =>
      currentPendencies.find((p) => p.targetId === targetId)

    const checks = [
      {
        id: 'portaria',
        condition:
          !!emenda.portaria || emenda.anexos.some((a) => a.tipo === 'PORTARIA'),
      },
      {
        id: 'proposta',
        condition: emenda.anexos.some((a) => a.tipo === 'PROPOSTA'),
      },
      {
        id: 'cie',
        condition:
          !!emenda.deliberacao_cie ||
          emenda.anexos.some((a) => a.tipo === 'DELIBERACAO_CIE'),
      },
      {
        id: 'oficio',
        condition: emenda.anexos.some((a) => a.tipo === 'OFICIO'),
      },
      {
        id: 'natureza',
        condition: !!emenda.natureza,
      },
      {
        id: 'objeto',
        condition: !!emenda.objeto_emenda,
      },
      {
        id: 'destino',
        condition: !!emenda.destino_recurso,
      },
      {
        id: 'valor_repasse',
        condition: !!emenda.valor_repasse && emenda.valor_repasse > 0,
      },
      {
        id: 'observacoes',
        condition: !!emenda.observacoes,
      },
      {
        id: 'finalidade',
        condition: !!emenda.descricao_completa,
      },
      {
        id: 'meta',
        condition: !!emenda.meta_operacional,
      },
    ]

    for (const check of checks) {
      const pendency = getPendency(check.id)
      if (
        pendency &&
        pendency.resolvida !== check.condition &&
        !pendency.dispensada
      ) {
        updates.push({ id: pendency.id, resolvida: check.condition })
      }
    }

    if (updates.length > 0) {
      for (const update of updates) {
        await supabase
          .from('pendencias')
          .update({ resolvida: update.resolvida })
          .eq('id', update.id)
      }
      return true
    }
    return false
  }, [])

  const fetchEmendaDetails = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      await syncPendenciesWithDb(id)

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

      const { data: pendenciasData, error: pendenciasError } = await supabase
        .from('pendencias')
        .select('*')
        .eq('emenda_id', id)

      if (pendenciasError) throw pendenciasError

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
        total_repassado: totalRepassado,
        total_gasto: totalGasto,
      }

      setEmendaData(detailedEmenda)

      const updated = await checkAutoResolution(detailedEmenda)
      if (updated) {
        const { data: newPendencias } = await supabase
          .from('pendencias')
          .select('*')
          .eq('emenda_id', id)
        if (newPendencias) {
          const refreshedPendencias = newPendencias.map((p: any) => ({
            id: p.id,
            descricao: p.descricao,
            dispensada: p.dispensada,
            resolvida: p.resolvida,
            justificativa: p.justificativa,
            targetType: p.target_type,
            targetId: p.target_id,
          }))
          setEmendaData((prev) =>
            prev ? { ...prev, pendencias: refreshedPendencias } : null,
          )
        }
      }
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
  }, [id, toast, syncPendenciesWithDb, checkAutoResolution])

  useEffect(() => {
    fetchEmendaDetails()
  }, [fetchEmendaDetails])

  const refreshData = async () => {
    await fetchEmendaDetails()
  }

  const handleEmendaDataChange = async (updatedEmenda: DetailedAmendment) => {
    if (isReadOnly || !emendaData) return

    try {
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

      setEmendaData(updatedEmenda)
      await checkAutoResolution(updatedEmenda)
      refreshData()
      toast({ title: 'Dados atualizados com sucesso!' })
    } catch (error: any) {
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
      if (!id) throw new Error('Emenda ID not found')
      const { id: _, ...repasseData } = repasse

      const { data, error } = await supabase
        .from('repasses')
        .insert([{ ...repasseData, emenda_id: id }])
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
        const newData = {
          ...prev,
          repasses: newRepasses,
          total_repassado: totalRepassado,
        }
        checkAutoResolution(newData)
        return newData
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
        const newData = {
          ...prev,
          repasses: newRepasses,
          total_repassado: totalRepassado,
        }
        checkAutoResolution(newData)
        return newData
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
      if (!id) throw new Error('Emenda ID not found')
      const { id: _, ...despesaData } = despesa

      const { data, error } = await supabase
        .from('despesas')
        .insert([
          {
            ...despesaData,
            emenda_id: id,
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
      if (!id) throw new Error('Emenda ID not found')
      const { id: _, ...anexoData } = anexo

      const { data, error } = await supabase
        .from('anexos')
        .insert([
          {
            filename: anexoData.filename,
            url: anexoData.url,
            tipo: anexoData.tipo,
            data_documento: anexoData.data,
            size: anexoData.size,
            metadata: anexoData.metadata,
            emenda_id: id,
            uploader: user?.id,
          },
        ])
        .select('*, profiles:uploader(name)')
        .single()

      if (error) throw error

      const newAnexo = {
        ...data,
        filename: data.filename,
        uploader: data.profiles?.name || 'Usuário',
      }

      setEmendaData((prev) => {
        if (!prev) return null
        const newData = { ...prev, anexos: [...prev.anexos, newAnexo as Anexo] }
        checkAutoResolution(newData)
        return newData
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
          filename: anexo.filename,
          url: anexo.url,
          tipo: anexo.tipo,
          data_documento: anexo.data,
          size: anexo.size,
          metadata: anexo.metadata,
        })
        .eq('id', anexo.id)

      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        const newData = {
          ...prev,
          anexos: prev.anexos.map((a) => (a.id === anexo.id ? anexo : a)),
        }
        checkAutoResolution(newData)
        return newData
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
      const anexoToDelete = emendaData?.anexos.find((a) => a.id === anexoId)

      if (anexoToDelete?.url && !anexoToDelete.url.startsWith('http')) {
        const { data: originalRecord } = await supabase
          .from('anexos')
          .select('url')
          .eq('id', anexoId)
          .single()

        if (originalRecord?.url) {
          await deleteFile(originalRecord.url)
        }
      }

      const { error } = await supabase.from('anexos').delete().eq('id', anexoId)
      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        const newData = {
          ...prev,
          anexos: prev.anexos.filter((a) => a.id !== anexoId),
        }
        checkAutoResolution(newData)
        return newData
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

  const handleDismissPendency = async (
    pendencyId: string,
    justification: string,
  ) => {
    if (isReadOnly || !emendaData) return

    try {
      const { error } = await supabase
        .from('pendencias')
        .update({
          dispensada: true,
          justificativa: justification,
        })
        .eq('id', pendencyId)

      if (error) throw error

      setEmendaData((prev) => {
        if (!prev) return null
        const newPendencias = prev.pendencias.map((p) =>
          p.id === pendencyId
            ? { ...p, dispensada: true, justificativa: justification }
            : p,
        )
        return { ...prev, pendencias: newPendencias }
      })
      toast({ title: 'Pendência dispensada com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao dispensar pendência',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handlePendencyClick = (pendencia: Pendencia) => {
    if (pendencia.targetType === 'field') {
      if (
        pendencia.targetId === 'descricao_completa' ||
        pendencia.targetId === 'finalidade'
      ) {
        const element = document.getElementById('objeto-finalidade-section')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } else {
        dadosTecnicosRef.current?.triggerEditAndFocus(pendencia.targetId)
      }
    } else if (pendencia.targetType === 'tab') {
      setActiveTab(
        pendencia.targetId === 'proposta' || pendencia.targetId === 'oficio'
          ? 'anexos'
          : pendencia.targetId,
      )
      setTimeout(() => {
        switch (pendencia.targetId) {
          case 'repasses':
            repassesTabRef.current?.triggerAdd()
            break
          case 'despesas':
            despesasTabRef.current?.triggerAdd()
            break
          case 'anexos':
          case 'proposta':
          case 'oficio':
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
        <div className="w-full overflow-x-auto pb-2 scrollbar-none">
          <TabsList className="inline-flex w-full min-w-max md:w-full md:grid md:grid-cols-6 p-1 h-auto">
            <TabsTrigger value="demonstrativo" className="px-4 py-2">
              Quadro Demonstrativo
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
        <TabsContent value="demonstrativo" className="mt-4">
          <EmendaQuadroDemonstrativoTab emenda={emendaData} />
        </TabsContent>
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
            onDismiss={handleDismissPendency}
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
