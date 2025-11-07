import { useState, useCallback } from 'react'
import { UploadCloud, File as FileIcon, X } from 'lucide-react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
  className?: string
}

export const FileUpload = ({
  onFilesAccepted,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.jpeg', '.png'],
    'application/pdf': ['.pdf'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
      '.xlsx',
    ],
    'text/csv': ['.csv'],
  },
  className,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setErrors([])
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
      setFiles(newFiles)
      onFilesAccepted(newFiles)

      if (fileRejections.length > 0) {
        const newErrors: string[] = []
        fileRejections.forEach((rejection) => {
          rejection.errors.forEach((error) => {
            if (error.code === 'file-too-large') {
              newErrors.push(
                `Arquivo "${rejection.file.name}" é muito grande. Máximo: ${
                  maxSize / 1024 / 1024
                }MB`,
              )
            } else if (error.code === 'file-invalid-type') {
              newErrors.push(
                `Tipo de arquivo inválido: "${rejection.file.name}"`,
              )
            } else {
              newErrors.push(`Erro com o arquivo: "${rejection.file.name}"`)
            }
          })
        })
        setErrors(newErrors)
      }
    },
    [files, maxFiles, maxSize, onFilesAccepted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesAccepted(newFiles)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer transition-colors',
          { 'border-primary bg-primary/10': isDragActive },
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          {isDragActive
            ? 'Solte os arquivos aqui...'
            : 'Arraste e solte arquivos aqui ou clique para selecionar'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Máximo de {maxFiles} arquivos, até {maxSize / 1024 / 1024}MB cada.
        </p>
      </div>
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, i) => (
            <p key={i} className="text-sm text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Arquivos Selecionados:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={file.name + index}
                className="flex items-center justify-between p-2 border rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium truncate">
                    {file.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
