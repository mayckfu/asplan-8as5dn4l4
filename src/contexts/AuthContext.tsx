import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { User, mockUsers, mockCargos } from '@/lib/mock-data'
import { useToast } from '@/components/ui/use-toast'

interface AuthContextType {
  user: User | null
  login: (email: string, password?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Initialize "Database" in localStorage if not present
  useEffect(() => {
    const storedUsers = localStorage.getItem('asplan_users_db')
    if (!storedUsers) {
      localStorage.setItem('asplan_users_db', JSON.stringify(mockUsers))
    }
    const storedCargos = localStorage.getItem('asplan_cargos_db')
    if (!storedCargos) {
      localStorage.setItem('asplan_cargos_db', JSON.stringify(mockCargos))
    }

    // Check for active session
    const storedUser = localStorage.getItem('asplan_user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      // Verify if user still exists and is active in the "DB"
      const currentUsers = JSON.parse(
        localStorage.getItem('asplan_users_db') || '[]',
      ) as User[]
      const dbUser = currentUsers.find((u) => u.id === parsedUser.id)

      if (dbUser && dbUser.status === 'ATIVO') {
        setUser(dbUser)
      } else {
        // If user was deleted or blocked, logout
        localStorage.removeItem('asplan_user')
        setUser(null)
      }
    } else {
      // Default login as Admin for demo purposes if no session
      // In a real app, this would be null
      const currentUsers = JSON.parse(
        localStorage.getItem('asplan_users_db') || '[]',
      ) as User[]
      const defaultAdmin = currentUsers.find((u) => u.role === 'ADMIN')
      if (defaultAdmin) {
        setUser(defaultAdmin)
        localStorage.setItem('asplan_user', JSON.stringify(defaultAdmin))
      }
    }
  }, [])

  const login = async (email: string, password?: string) => {
    const currentUsers = JSON.parse(
      localStorage.getItem('asplan_users_db') || '[]',
    ) as User[]
    const foundUser = currentUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )

    if (!foundUser) {
      toast({
        title: 'Erro de login',
        description: 'Usuário não encontrado.',
        variant: 'destructive',
      })
      return
    }

    if (foundUser.status === 'BLOQUEADO') {
      toast({
        title: 'Acesso negado',
        description: 'Sua conta está bloqueada. Contate o administrador.',
        variant: 'destructive',
      })
      return
    }

    // Simple password check for mock purposes
    if (password && foundUser.password && password !== foundUser.password) {
      toast({
        title: 'Erro de login',
        description: 'Senha incorreta.',
        variant: 'destructive',
      })
      return
    }

    setUser(foundUser)
    localStorage.setItem('asplan_user', JSON.stringify(foundUser))
    toast({
      title: 'Login realizado',
      description: `Bem-vindo, ${foundUser.name}!`,
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('asplan_user')
    toast({
      title: 'Logout',
      description: 'Você saiu do sistema.',
    })
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
