import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAmendmentDetails } from '@/lib/mock-data'
import { EmendaDetailHeader } from '@/components/emendas/EmendaDetailHeader'
import { EmendaResumoTab } from '@/components/emendas/EmendaResumoTab'
import { EmendaRepassesTab } from '@/components/emendas/EmendaRepassesTab'
import { EmendaDespesasTab } from '@/components/emendas/EmendaDespesasTab'
import { EmendaAnexosTab } from '@/components/emendas/EmendaAnexosTab'
import { EmendaChecklistTab } from '@/components/emendas/EmendaChecklistTab'
import { EmendaHistoricoTab } from '@/components/emendas/EmendaHistoricoTab'

const EmendaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('resumo')

  const emenda = getAmendmentDetails(id || '')

  const handleGenerateDossier = () => {
    alert('Gerando Dossiê da Emenda em PDF...')
  }

  if (!emenda) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-200">
          Emenda não encontrada
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
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
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 text-neutral-900 dark:text-neutral-200">
          Detalhes da Emenda
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" onClick={handleGenerateDossier}>
            <FileText className="mr-2 h-4 w-4" />
            Gerar Dossiê
          </Button>
          <Button size="sm">Salvar Emenda</Button>
        </div>
      </div>

      <EmendaDetailHeader
        emenda={emenda}
        onPendencyClick={() => setActiveTab('checklist')}
      />

      <Tabs
        defaultValue="resumo"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="repasses">Repasses</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="resumo" className="mt-4">
          <EmendaResumoTab emenda={emenda} />
        </TabsContent>
        <TabsContent value="repasses" className="mt-4">
          <EmendaRepassesTab repasses={emenda.repasses} />
        </TabsContent>
        <TabsContent value="despesas" className="mt-4">
          <EmendaDespesasTab despesas={emenda.despesas} />
        </TabsContent>
        <TabsContent value="anexos" className="mt-4">
          <EmendaAnexosTab anexos={emenda.anexos} />
        </TabsContent>
        <TabsContent value="checklist" className="mt-4">
          <EmendaChecklistTab pendencias={emenda.pendencias} />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <EmendaHistoricoTab historico={emenda.historico} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EmendaDetailPage
