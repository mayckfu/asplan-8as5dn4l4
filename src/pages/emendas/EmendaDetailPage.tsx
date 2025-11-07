import { useState, useEffect } from 'react'
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
} from '@/lib/mock-data'
import { EmendaDetailHeader } from '@/components/emendas/EmendaDetailHeader'
import { EmendaDadosTecnicos } from '@/components/emendas/EmendaDadosTecnicos'
import { EmendaObjetoFinalidade } from '@/components/emendas/EmendaObjetoFinalidade'
import { EmendaRepassesTab } from '@/components/emendas/EmendaRepassesTab'
import { EmendaDespesasTab } from '@/components/emendas/EmendaDespesasTab'
import { EmendaAnexosTab } from '@/components/emendas/EmendaAnexosTab'
import { EmendaChecklistTab } from '@/components/emendas/EmendaChecklistTab'
import { EmendaHistoricoTab } from '@/components/emendas/EmendaHistoricoTab'

const EmendaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('repasses')
  const [emendaData, setEmendaData] = useState<DetailedAmendment | null>(null)

  useEffect(() => {
    const data = getAmendmentDetails(id || '')
    setEmendaData(data || null)
  }, [id])

  const handleEmendaDataChange = (updatedEmenda: DetailedAmendment) => {
    const pendencias: Pendencia[] = []
    if (!updatedEmenda.portaria) {
      pendencias.push({
        id: `p-${id}-portaria`,
        descricao: 'Falta Portaria',
        dispensada: false,
      })
    }
    if (!updatedEmenda.deliberacao_cie) {
      pendencias.push({
        id: `p-${id}-cie`,
        descricao: 'Falta Deliberação CIE',
        dispensada: false,
      })
    }
    if (!updatedEmenda.objeto_emenda) {
      pendencias.push({
        id: `p-${id}-objeto`,
        descricao: 'Falta Objeto',
        dispensada: false,
      })
    }
    if (!updatedEmenda.meta_operacional) {
      pendencias.push({
        id: `p-${id}-meta`,
        descricao: 'Falta Meta Operacional',
        dispensada: false,
      })
    }
    if (updatedEmenda.total_gasto > updatedEmenda.total_repassado) {
      pendencias.push({
        id: `p-${id}-despesas`,
        descricao: 'Despesas > Repasses',
        dispensada: false,
      })
    }
    setEmendaData({ ...updatedEmenda, pendencias })
  }

  const handleDespesasChange = (newDespesas: Despesa[]) => {
    if (emendaData) {
      setEmendaData({ ...emendaData, despesas: newDespesas })
    }
  }

  const handleAnexosChange = (newAnexos: Anexo[]) => {
    if (emendaData) {
      setEmendaData({ ...emendaData, anexos: newAnexos })
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
      />

      <EmendaDadosTecnicos
        emenda={emendaData}
        onEmendaChange={handleEmendaDataChange}
      />

      <EmendaObjetoFinalidade description={emendaData.descricao_completa} />

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
          <EmendaRepassesTab repasses={emendaData.repasses} />
        </TabsContent>
        <TabsContent value="despesas" className="mt-4">
          <EmendaDespesasTab
            despesas={emendaData.despesas}
            onDespesasChange={handleDespesasChange}
          />
        </TabsContent>
        <TabsContent value="anexos" className="mt-4">
          <EmendaAnexosTab
            anexos={emendaData.anexos}
            onAnexosChange={handleAnexosChange}
          />
        </TabsContent>
        <TabsContent value="checklist" className="mt-4">
          <EmendaChecklistTab pendencias={emendaData.pendencias} />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <EmendaHistoricoTab historico={emendaData.historico} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EmendaDetailPage
