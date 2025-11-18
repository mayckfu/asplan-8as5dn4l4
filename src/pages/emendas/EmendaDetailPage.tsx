import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getAmendmentDetails,
  DetailedAmendment,
  Despesa,
  Anexo,
  Pendencia,
  Repasse,
  StatusInternoEnum,
  StatusInterno,
  SituacaoOficialEnum,
  SituacaoOficial,
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

const EmendaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('repasses')
  const [emendaData, setEmendaData] = useState<DetailedAmendment | null>(null)

  const dadosTecnicosRef = useRef<EmendaDadosTecnicosHandles>(null)
  const repassesTabRef = useRef<EmendaRepassesTabHandles>(null)
  const despesasTabRef = useRef<EmendaDespesasTabHandles>(null)
  const anexosTabRef = useRef<HTMLDivElement>(null)

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
        'descricao_completa', // This is handled by EmendaObjetoFinalidade but we can point to it
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

  useEffect(() => {
    const data = getAmendmentDetails(id || '')
    if (data) {
      const calculatedPendencies = calculatePendencies(data)
      setEmendaData({ ...data, pendencias: calculatedPendencies })
    } else {
      setEmendaData(null)
    }
  }, [id, calculatePendencies])

  const handleEmendaDataChange = (updatedEmenda: DetailedAmendment) => {
    const newPendencies = calculatePendencies(updatedEmenda)
    setEmendaData({ ...updatedEmenda, pendencias: newPendencies })
  }

  const handleFinalidadeChange = (newDescription: string) => {
    if (emendaData) {
      handleEmendaDataChange({
        ...emendaData,
        descricao_completa: newDescription,
      })
    }
  }

  const handleDespesasChange = (newDespesas: Despesa[]) => {
    if (emendaData) {
      const newTotalGasto = newDespesas.reduce((sum, d) => sum + d.valor, 0)
      handleEmendaDataChange({
        ...emendaData,
        despesas: newDespesas,
        total_gasto: newTotalGasto,
      })
    }
  }

  const handleRepassesChange = (newRepasses: Repasse[]) => {
    if (emendaData) {
      const newTotalRepassado = newRepasses.reduce(
        (sum, r) => (r.status === 'REPASSADO' ? sum + r.valor : sum),
        0,
      )
      handleEmendaDataChange({
        ...emendaData,
        repasses: newRepasses,
        total_repassado: newTotalRepassado,
      })
    }
  }

  const handleAnexosChange = (newAnexos: Anexo[]) => {
    if (emendaData) {
      handleEmendaDataChange({ ...emendaData, anexos: newAnexos })
    }
  }

  const handleStatusInternoChange = (newStatus: StatusInternoEnum) => {
    if (emendaData) {
      const newHistoryItem: Historico = {
        id: `h-${Date.now()}`,
        emenda_id: emendaData.id,
        evento: 'INTERNAL_STATUS_CHANGE',
        detalhe: StatusInterno[newStatus],
        feito_por: 'Usuário Atual', // Mocked user
        criado_em: new Date().toISOString(),
      }

      handleEmendaDataChange({
        ...emendaData,
        status_interno: newStatus,
        historico: [...emendaData.historico, newHistoryItem],
      })

      toast({
        title: 'Status interno atualizado',
        description: `O status interno foi alterado para "${StatusInterno[newStatus]}".`,
      })
    }
  }

  const handleStatusOficialChange = (newStatus: SituacaoOficialEnum) => {
    if (emendaData) {
      const newHistoryItem: Historico = {
        id: `h-${Date.now()}`,
        emenda_id: emendaData.id,
        evento: 'OFFICIAL_STATUS_CHANGE',
        detalhe: SituacaoOficial[newStatus],
        feito_por: 'Usuário Atual', // Mocked user
        criado_em: new Date().toISOString(),
      }

      handleEmendaDataChange({
        ...emendaData,
        situacao: newStatus,
        historico: [...emendaData.historico, newHistoryItem],
      })

      toast({
        title: 'Status oficial atualizado',
        description: `O status oficial foi alterado para "${SituacaoOficial[newStatus]}".`,
      })
    }
  }

  const handlePendencyClick = (pendencia: Pendencia) => {
    if (pendencia.targetType === 'field') {
      if (pendencia.targetId === 'descricao_completa') {
        // Scroll to Objeto e Finalidade
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

  if (!emendaData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Emenda não encontrada</h2>
        <p className="text-muted-foreground">
          A emenda com o ID "{id}" não foi encontrada.
        </p>
        <Button onClick={() => navigate('/emendas')} className="mt-4">
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
        onPendencyClick={() => setActiveTab('checklist')}
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
            onRepassesChange={handleRepassesChange}
          />
        </TabsContent>
        <TabsContent value="despesas" className="mt-4">
          <EmendaDespesasTab
            ref={despesasTabRef}
            despesas={emendaData.despesas}
            onDespesasChange={handleDespesasChange}
          />
        </TabsContent>
        <TabsContent value="anexos" className="mt-4">
          <div ref={anexosTabRef}>
            <EmendaAnexosTab
              anexos={emendaData.anexos}
              onAnexosChange={handleAnexosChange}
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
