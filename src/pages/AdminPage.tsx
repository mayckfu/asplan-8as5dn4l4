import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersTable } from '@/components/admin/UsersTable'
import { RolesTable } from '@/components/admin/RolesTable'
import { useAuth } from '@/contexts/AuthContext'
import { mockUsers, mockCargos, User, Cargo } from '@/lib/mock-data'

const AdminPage = () => {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [cargos, setCargos] = useState<Cargo[]>(mockCargos)

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    )
  }

  const handleCreateUser = (newUser: Omit<User, 'id' | 'created_at'>) => {
    const user: User = {
      ...newUser,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, user])
  }

  const handleUpdateCargo = (updatedCargo: Cargo) => {
    setCargos((prev) =>
      prev.map((c) => (c.id === updatedCargo.id ? updatedCargo : c)),
    )
  }

  const handleCreateCargo = (newCargo: Omit<Cargo, 'id'>) => {
    const cargo: Cargo = {
      ...newCargo,
      id: String(Date.now()),
    }
    setCargos((prev) => [...prev, cargo])
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
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="roles">Cargos / Perfis</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="mt-6">
              <UsersTable
                users={users}
                cargos={cargos}
                onUpdateUser={handleUpdateUser}
                onCreateUser={handleCreateUser}
              />
            </TabsContent>
            <TabsContent value="roles" className="mt-6">
              <RolesTable
                cargos={cargos}
                onUpdateCargo={handleUpdateCargo}
                onCreateCargo={handleCreateCargo}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPage
