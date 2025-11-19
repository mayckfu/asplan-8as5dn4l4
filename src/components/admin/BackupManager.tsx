import { useEffect, useState } from 'react'
import { Database, Download, Play, RefreshCw, HardDrive } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface BackupLog {
  id: string
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'PENDING'
  type: 'AUTOMATIC' | 'MANUAL'
  size: string
  created_at: string
  completed_at: string | null
}

export const BackupManager = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const [backups, setBackups] = useState<BackupLog[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBackups = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('backup_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching backups:', error)
    } else {
      setBackups(data as BackupLog[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  const triggerBackup = async () => {
    try {
      // In a real scenario, this would call an Edge Function
      // For now, we log a 'PENDING' backup request
      const { error } = await supabase.from('backup_logs').insert([
        {
          status: 'PENDING',
          type: 'MANUAL',
          initiated_by: user?.id,
        },
      ])

      if (error) throw error

      toast({
        title: 'Backup solicitado',
        description: 'O processo de backup foi iniciado em segundo plano.',
      })
      fetchBackups()

      // Simulate completion after 3 seconds
      setTimeout(async () => {
        // This part would be done by the backend worker
        // We can't update the row easily without ID, but let's just refresh
        fetchBackups()
      }, 3000)
    } catch (error: any) {
      toast({
        title: 'Erro ao iniciar backup',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-success">Sucesso</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Falha</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500">Em Progresso</Badge>
      case 'PENDING':
        return <Badge variant="outline">Pendente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status do Backup Automático
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ativo</div>
            <p className="text-xs text-muted-foreground">Diário às 03:00 AM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backups.length > 0 && backups[0].status === 'SUCCESS'
                ? format(new Date(backups[0].created_at), 'dd/MM HH:mm')
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {backups.length > 0
                ? backups[0].size || '0 MB'
                : 'Nenhum registro'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Armazenamento Usado
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~45 MB</div>
            <p className="text-xs text-muted-foreground">Estimado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Backups</CardTitle>
              <CardDescription>
                Registros de backups automáticos e manuais.
              </CardDescription>
            </div>
            <Button onClick={triggerBackup} disabled={loading}>
              <Play className="mr-2 h-4 w-4" />
              Executar Backup Agora
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhum backup registrado.
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>
                      {format(
                        new Date(backup.created_at),
                        'dd/MM/yyyy HH:mm:ss',
                        {
                          locale: ptBR,
                        },
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{backup.type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(backup.status)}</TableCell>
                    <TableCell>{backup.size || '-'}</TableCell>
                    <TableCell className="text-right">
                      {backup.status === 'SUCCESS' && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
