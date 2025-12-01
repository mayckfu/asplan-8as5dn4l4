import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTable } from '@/components/admin/UsersTable'
import { RolesTable } from '@/components/admin/RolesTable'
import { AuditLogsTable } from '@/components/admin/AuditLogsTable'
import { SecurityNotifications } from '@/components/admin/SecurityNotifications'
import { BackupManager } from '@/components/admin/BackupManager'
import { useAuth } from '@/contexts/AuthContext'
import { User, Cargo, AuditLog } from '@/lib/mock-data'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Shield, Database, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AdminPage = () => {
  const { isAdmin, user } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])
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

      const { data: cargosData, error: cargosError } = await supabase
        .from('cargos')
        .select('*')
        .order('nome', { ascending: true })

      if (cargosError) throw cargosError

      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*, profiles:changed_by(name)')
        .order('changed_at', { ascending: false })
        .limit(100)

      if (logsError) throw logsError

      setUsers(usersData as User[])
      setCargos(cargosData as Cargo[])
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
          cargo_id: updatedUser.cargo_id,
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
      // Call Edge Function to create user in Auth AND Profiles
      const { data: profileData, error: funcError } =
        await supabase.functions.invoke('create-user', {
          body: {
            email: newUser.email,
            password: newUser.password,
            name: newUser.name,
            cpf: newUser.cpf,
            role: newUser.role,
            cargo_id: newUser.cargo_id,
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

      // Log CREATE_USER action
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

  const handleUpdateCargo = async (updatedCargo: Cargo) => {
    try {
      const { error } = await supabase
        .from('cargos')
        .update({
          nome: updatedCargo.nome,
          descricao: updatedCargo.descricao,
          default_role: updatedCargo.default_role,
          active: updatedCargo.active,
        })
        .eq('id', updatedCargo.id)

      if (error) throw error

      setCargos((prev) =>
        prev.map((c) => (c.id === updatedCargo.id ? updatedCargo : c)),
      )
      toast({ title: 'Cargo atualizado com sucesso.' })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar cargo',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleCreateCargo = async (newCargo: Omit<Cargo, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .insert([newCargo])
        .select()
        .single()

      if (error) throw error

      setCargos((prev) => [...prev, data as Cargo])
      toast({ title: 'Cargo criado com sucesso.' })
    } catch (error: any) {
      toast({
        title: 'Erro ao criar cargo',
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
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">
        Administração
      </h1>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
            Painel de Controle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-[800px]">
              <TabsTrigger value="users">Gerenciamento de Usuários</TabsTrigger>
              <TabsTrigger value="roles">Cargos</TabsTrigger>
              <TabsTrigger value="audit">Auditoria</TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Segurança
              </TabsTrigger>
              <TabsTrigger value="backups" className="flex items-center gap-2">
                <Database className="h-4 w-4" /> Backups
              </TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="mt-6">
              <UsersTable
                users={users}
                cargos={cargos}
                onUpdateUser={handleUpdateUser}
                onCreateUser={handleCreateUser}
                onDeleteUser={handleDeleteUser}
                onResetPassword={handleResetPassword}
              />
            </TabsContent>
            <TabsContent value="roles" className="mt-6">
              <RolesTable
                cargos={cargos}
                onUpdateCargo={handleUpdateCargo}
                onCreateCargo={handleCreateCargo}
              />
            </TabsContent>
            <TabsContent value="audit" className="mt-6">
              <AuditLogsTable logs={auditLogs} />
            </TabsContent>
            <TabsContent value="security" className="mt-6">
              <SecurityNotifications />
            </TabsContent>
            <TabsContent value="backups" className="mt-6">
              <BackupManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPage
