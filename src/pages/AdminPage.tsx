import { useState, useEffect } from 'react'
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
import { Loader2, Shield, Database } from 'lucide-react'

const AdminPage = () => {
  const { isAdmin, user } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
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
        console.error('Error fetching admin data:', error)
        toast({
          title: 'Erro ao carregar dados',
          description: error.message,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin, toast])

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
      // Call Edge Function to create user in Auth
      const { data: authData, error: authError } =
        await supabase.functions.invoke('create-user', {
          body: {
            email: newUser.email,
            password: newUser.password,
            email_confirm: true,
          },
        })

      if (authError) throw new Error(authError.message || 'Erro na função')
      if (authData?.error) throw new Error(authData.error)

      const newUserId = authData.user.id

      // Create Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: newUserId,
            name: newUser.name,
            email: newUser.email,
            cpf: newUser.cpf,
            role: newUser.role,
            cargo_id: newUser.cargo_id,
            unidade: newUser.unidade,
            status: newUser.status,
          },
        ])
        .select()
        .single()

      if (profileError) throw profileError

      // Manually log CREATE_USER action
      await supabase.from('audit_logs').insert([
        {
          table_name: 'profiles',
          record_id: newUserId,
          action: 'CREATE_USER',
          new_data: profileData,
          changed_by: user?.id,
        },
      ])

      setUsers((prev) => [profileData as User, ...prev])
      toast({ title: 'Usuário criado com sucesso.' })
    } catch (error: any) {
      console.error('Error creating user:', error)
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
