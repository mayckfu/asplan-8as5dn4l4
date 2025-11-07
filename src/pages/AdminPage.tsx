import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AdminPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">
        Administração
      </h1>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
            Painel de Administração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 dark:text-neutral-400">
            Esta página é restrita a administradores. Funcionalidades como
            gerenciamento de usuários, configurações do sistema e logs de
            auditoria estarão disponíveis aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPage
