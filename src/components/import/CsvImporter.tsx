import { useState } from 'react'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { FileUpload } from '@/components/FileUpload'
import { ColumnMapper } from '@/components/import/ColumnMapper'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type ImportStep = 'select_file' | 'map_columns' | 'importing' | 'completed'

interface CsvImporterProps {
  dataType: 'emendas' | 'repasses' | 'despesas'
  targetFields: { key: string; label: string; required: boolean }[]
}

// Mock function to simulate CSV parsing
const parseCsvHeaders = async (file: File): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (file.name.includes('emendas')) {
        resolve(['autor', 'numero_emenda', 'valor', 'data_criacao', 'situacao'])
      } else {
        resolve(['data', 'valor', 'descricao', 'fornecedor', 'emenda_id'])
      }
    }, 500)
  })
}

// Mock function to simulate the import process
const simulateImport = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: Math.random() > 0.1, // 90% success rate
        imported: Math.floor(Math.random() * 100) + 50,
        failed: Math.floor(Math.random() * 10),
        message: 'Importação concluída com sucesso.',
      })
    }, 2000)
  })
}

export const CsvImporter = ({ dataType, targetFields }: CsvImporterProps) => {
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
    // Simulate progress
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
    <div className="p-6 border rounded-lg">
      {step === 'select_file' && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
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
          <p className="text-lg font-medium">Importando dados...</p>
          <Progress value={progress} className="w-full max-w-md" />
        </div>
      )}

      {step === 'completed' && importResult && (
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
          {importResult.success ? (
            <CheckCircle className="h-16 w-16 text-success" />
          ) : (
            <AlertTriangle className="h-16 w-16 text-destructive" />
          )}
          <h3 className="text-2xl font-bold">
            {importResult.success
              ? 'Importação Concluída'
              : 'Falha na Importação'}
          </h3>
          <p>
            {importResult.imported} registros importados com sucesso.
            <br />
            {importResult.failed} registros falharam.
          </p>
          <Button onClick={handleReset}>Importar outro arquivo</Button>
        </div>
      )}
    </div>
  )
}
