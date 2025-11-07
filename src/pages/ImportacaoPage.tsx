import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CsvImporter } from '@/components/import/CsvImporter'

const emendasFields = [
  { key: 'tipo', label: 'Tipo', required: true },
  { key: 'tipo_recurso', label: 'Tipo de Recurso', required: true },
  { key: 'autor', label: 'Autor', required: true },
  { key: 'numero_emenda', label: 'Número da Emenda', required: false },
  { key: 'numero_proposta', label: 'Número da Proposta', required: true },
  { key: 'valor_total', label: 'Valor Total', required: true },
  { key: 'situacao', label: 'Situação Oficial', required: true },
  { key: 'created_at', label: 'Data de Criação', required: true },
]

const repassesFields = [
  { key: 'emenda_id', label: 'ID da Emenda', required: true },
  { key: 'data', label: 'Data', required: true },
  { key: 'valor', label: 'Valor', required: true },
  { key: 'fonte', label: 'Fonte', required: false },
]

const despesasFields = [
  { key: 'emenda_id', label: 'ID da Emenda', required: true },
  { key: 'data', label: 'Data', required: true },
  { key: 'valor', label: 'Valor', required: true },
  { key: 'categoria', label: 'Categoria', required: true },
  { key: 'descricao', label: 'Descrição', required: false },
  {
    key: 'registrada_por',
    label: 'Registrada Por (email/nome)',
    required: true,
  },
  { key: 'unidade_destino', label: 'Unidade de Destino', required: false },
  { key: 'fornecedor_nome', label: 'Fornecedor', required: false },
  { key: 'status_execucao', label: 'Status de Execução', required: false },
]

const ImportacaoPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-800">
        Importação de Dados
      </h1>
      <p className="text-neutral-600">
        Importe dados de emendas, repasses e despesas a partir de arquivos CSV.
        Siga as etapas para selecionar o arquivo, mapear as colunas e iniciar a
        importação.
      </p>

      <Tabs defaultValue="emendas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emendas">Emendas</TabsTrigger>
          <TabsTrigger value="repasses">Repasses</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="emendas" className="mt-4">
          <CsvImporter dataType="emendas" targetFields={emendasFields} />
        </TabsContent>
        <TabsContent value="repasses" className="mt-4">
          <CsvImporter dataType="repasses" targetFields={repassesFields} />
        </TabsContent>
        <TabsContent value="despesas" className="mt-4">
          <CsvImporter dataType="despesas" targetFields={despesasFields} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ImportacaoPage
