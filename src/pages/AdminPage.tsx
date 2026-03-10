import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTable } from '@/components/admin/UsersTable'
import { AuditLogsTable } from '@/components/admin/AuditLogsTable'
import { SecurityNotifications } from '@/components/admin/SecurityNotifications'
import { useAuth } from '@/contexts/AuthContext'
import { User, AuditLog } from '@/lib/mock-data'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Shield, AlertTriangle, Users, History } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AdminPage = () => {
  const { isAdmin, user } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*, profiles:changed_by(name)')
        .order('changed_at', { ascending: false })
        .limit(100)

      if (logsError) throw logsError

      setUsers(usersData as User[])
      setAuditLogs(
        logsData.map((log: any) => ({
          ...log,
          changed_by: log.profiles?.name || 'Sistema',
        })) as AuditLog[],
      )
    } catch (error: any) {
      console.error('Error fetching admin data:', error.message)
      setError(error.message || 'Erro ao carregar dados administrativos.')
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin, fetchData])

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          cpf: updatedUser.cpf,
          role: updatedUser.role,
          unidade: updatedUser.unidade,
          status: updatedUser.status,
        })
        .eq('id', updatedUser.id)

      if (error) throw error

      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      )
      toast({ title: 'Usuário atualizado com sucesso.' })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar usuário',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleCreateUser = async (newUser: Omit<User, 'id' | 'created_at'>) => {
    try {
      const { data: profileData, error: funcError } =
        await supabase.functions.invoke('create-user', {
          body: {
            email: newUser.email,
            password: newUser.password,
            name: newUser.name,
            cpf: newUser.cpf,
            role: newUser.role,
            unidade: newUser.unidade,
            status: newUser.status,
            email_confirm: true,
          },
        })

      if (funcError) {
        throw new Error(funcError.message || 'Erro ao conectar com o servidor')
      }

      if (profileData?.error) {
        throw new Error(profileData.error)
      }

      if (!profileData || !profileData.id) {
        throw new Error('Dados do usuário não retornados.')
      }

      await supabase.from('audit_logs').insert([
        {
          table_name: 'profiles',
          record_id: profileData.id,
          action: 'CREATE_USER',
          new_data: profileData,
          changed_by: user?.id,
        },
      ])

      setUsers((prev) => [profileData as User, ...prev])
      toast({ title: 'Usuário criado com sucesso.' })
    } catch (error: any) {
      console.error('Error creating user:', error.message)
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast({ title: 'Usuário excluído com sucesso.' })
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir usuário',
        description:
          'Talvez você não tenha permissão para excluir usuários do sistema de autenticação. Tente bloquear.',
        variant: 'destructive',
      })
    }
  }

  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast({
        title: 'Email enviado',
        description: `Link de redefinição enviado para ${email}.`,
      })
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast({
        title: 'Erro ao enviar email',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchData}>Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-200">
          Administração
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie usuários, perfis de acesso e configurações globais do
          sistema.
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full space-y-6">
        <TabsList className="flex flex-wrap w-full md:inline-flex h-auto gap-1 p-1 bg-muted/50">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" /> Auditoria
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="shadow-sm border border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Adicione, edite ou bloqueie o acesso de usuários ao sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable
                users={users}
                onUpdateUser={handleUpdateUser}
                onCreateUser={handleCreateUser}
                onDeleteUser={handleDeleteUser}
                onResetPassword={handleResetPassword}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="shadow-sm border border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>
                Acompanhe o histórico de ações e alterações realizadas no
                sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogsTable logs={auditLogs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <SecurityNotifications />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminPage
