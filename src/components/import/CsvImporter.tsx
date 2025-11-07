import { useState } from 'react'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { FileUpload } from '@/components/FileUpload'
import { ColumnMapper } from '@/components/import/ColumnMapper'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type ImportStep = 'select_file' | 'map_columns' | 'importing' | 'completed'

interface CsvImporterProps {
  dataType: 'emendas' | 'repasses' | 'despesas'
  targetFields: { key: string; label: string; required: boolean }[]
}

const parseCsvHeaders = async (file: File): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (file.name.includes('emendas')) {
        resolve([
          'autor',
          'numero_emenda',
          'valor_total',
          'created_at',
          'situacao',
          'portaria',
        ])
      } else if (file.name.includes('despesas')) {
        resolve([
          'data',
          'valor',
          'descricao',
          'fornecedor_nome',
          'emenda_id',
          'registrada_por',
          'status_execucao',
        ])
      } else {
        resolve(['data', 'valor', 'fonte', 'emenda_id'])
      }
    }, 500)
  })
}

const simulateImport = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1
      const result = {
        success,
        imported: Math.floor(Math.random() * 100) + 50,
        failed: success ? Math.floor(Math.random() * 10) : 30,
        logs: [
          'INFO: Iniciando importação...',
          'NORMALIZATION: Normalizado valor "R$ 150.000,00" para 150000.00 na linha 2.',
          'NORMALIZATION: Normalizada data "15/01/2023" para "2023-01-15T03:00:00.000Z" na linha 2.',
          'LINKING: Usuário "admin@example.com" vinculado com sucesso na linha 3.',
          'WARNING: Não foi possível vincular o usuário "fulano" na linha 4. Valor definido como nulo.',
          'DEFAULT: Status de execução não informado na linha 5, definido como "PLANEJADA".',
          'PENDENCY: Campo "portaria" não encontrado para a emenda na linha 6. Pendência "Falta Portaria" criada.',
          `ERROR: Formato de valor inválido "abc" na linha 7.`,
        ],
        message: success
          ? 'Importação concluída com sucesso.'
          : 'Importação concluída com erros.',
      }
      resolve(result)
    }, 2000)
  })
}

export const CsvImporter = ({ targetFields }: CsvImporterProps) => {
  const [step, setStep] = useState<ImportStep>('select_file')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      setCsvFile(file)
      const headers = await parseCsvHeaders(file)
      setCsvHeaders(headers)
      setStep('map_columns')
    }
  }

  const handleMappingChange = (newMapping: Record<string, string>) => {
    setMapping((prev) => ({ ...prev, ...newMapping }))
  }

  const handleConfirmImport = async () => {
    setStep('importing')
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 10))
    }, 200)

    const result = await simulateImport()
    clearInterval(interval)
    setProgress(100)
    setImportResult(result)
    setStep('completed')
  }

  const handleReset = () => {
    setStep('select_file')
    setCsvFile(null)
    setCsvHeaders([])
    setMapping({})
    setImportResult(null)
    setProgress(0)
  }

  return (
    <div className="p-6 border rounded-2xl shadow-sm border-neutral-200 dark:border-neutral-800">
      {step === 'select_file' && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-neutral-200">
            1. Selecione o arquivo CSV
          </h3>
          <FileUpload
            onFilesAccepted={handleFileSelect}
            maxFiles={1}
            accept={{ 'text/csv': ['.csv'] }}
          />
        </div>
      )}

      {step === 'map_columns' && csvFile && (
        <ColumnMapper
          headers={csvHeaders}
          targetFields={targetFields}
          onMappingChange={handleMappingChange}
          onConfirm={handleConfirmImport}
          onCancel={handleReset}
        />
      )}

      {step === 'importing' && (
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-neutral-900 dark:text-neutral-200">
            Importando dados...
          </p>
          <Progress value={progress} className="w-full max-w-md" />
        </div>
      )}

      {step === 'completed' && importResult && (
        <div className="flex flex-col items-center justify-center space-y-6 min-h-[200px]">
          {importResult.success ? (
            <CheckCircle className="h-16 w-16 text-success" />
          ) : (
            <AlertTriangle className="h-16 w-16 text-destructive" />
          )}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-200">
              {importResult.message}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {importResult.imported} registros importados com sucesso.
              <br />
              {importResult.failed} registros falharam.
            </p>
          </div>
          <Alert className="w-full max-w-2xl">
            <AlertTitle className="text-neutral-900 dark:text-neutral-200">
              Log de Importação
            </AlertTitle>
            <AlertDescription className="max-h-40 overflow-y-auto text-xs font-mono text-neutral-600 dark:text-neutral-400">
              {importResult.logs.map((log: string, i: number) => (
                <div key={i}>{log}</div>
              ))}
            </AlertDescription>
          </Alert>
          <Button onClick={handleReset}>Importar outro arquivo</Button>
        </div>
      )}
    </div>
  )
}
