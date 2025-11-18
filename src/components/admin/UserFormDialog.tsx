import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, Cargo, UserRole, UserStatus } from '@/lib/mock-data'

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'GESTOR', 'ANALISTA', 'CONSULTA'] as const),
  cargo_id: z.string().optional(),
  unidade: z.string().optional(),
  status: z.enum(['ATIVO', 'BLOQUEADO', 'PENDENTE'] as const),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  cargos: Cargo[]
  onSubmit: (data: UserFormValues) => void
}

export const UserFormDialog = ({
  open,
  onOpenChange,
  user,
  cargos,
  onSubmit,
}: UserFormDialogProps) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'CONSULTA',
      cargo_id: '',
      unidade: '',
      status: 'ATIVO',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        cargo_id: user.cargo_id || '',
        unidade: user.unidade || '',
        status: user.status,
      })
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'CONSULTA',
        cargo_id: '',
        unidade: '',
        status: 'ATIVO',
      })
    }
  }, [user, form, open])

  const handleSubmit = (values: UserFormValues) => {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do usuário abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="joao@asplan.gov" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil de Acesso</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="GESTOR">Gestor</SelectItem>
                        <SelectItem value="ANALISTA">Analista</SelectItem>
                        <SelectItem value="CONSULTA">Consulta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cargos.map((cargo) => (
                          <SelectItem key={cargo.id} value={cargo.id}>
                            {cargo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade / Setor</FormLabel>
                    <FormControl>
                      <Input placeholder="Financeiro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Inicial</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ATIVO">Ativo</SelectItem>
                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                        <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
