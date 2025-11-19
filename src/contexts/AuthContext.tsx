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
  login: (
    email: string,
    password?: string,
    rememberMe?: boolean,
  ) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Initialize "Database" in localStorage if not present
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUsers = localStorage.getItem('asplan_users_db')
        if (!storedUsers) {
          localStorage.setItem('asplan_users_db', JSON.stringify(mockUsers))
        }
        const storedCargos = localStorage.getItem('asplan_cargos_db')
        if (!storedCargos) {
          localStorage.setItem('asplan_cargos_db', JSON.stringify(mockCargos))
        }

        // Check for active session in both storages
        const storedUser =
          localStorage.getItem('asplan_user') ||
          sessionStorage.getItem('asplan_user')

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
            sessionStorage.removeItem('asplan_user')
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (
    email: string,
    password?: string,
    rememberMe: boolean = false,
  ): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const currentUsers = JSON.parse(
        localStorage.getItem('asplan_users_db') || '[]',
      ) as User[]
      const foundUser = currentUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      )

      if (!foundUser) {
        toast({
          title: 'Erro de login',
          description: 'Credenciais inválidas.',
          variant: 'destructive',
        })
        return false
      }

      if (foundUser.status === 'BLOQUEADO') {
        toast({
          title: 'Acesso negado',
          description: 'Sua conta está bloqueada. Contate o administrador.',
          variant: 'destructive',
        })
        return false
      }

      // Simple password check for mock purposes
      if (password && foundUser.password && password !== foundUser.password) {
        toast({
          title: 'Erro de login',
          description: 'Credenciais inválidas.',
          variant: 'destructive',
        })
        return false
      }

      setUser(foundUser)

      if (rememberMe) {
        localStorage.setItem('asplan_user', JSON.stringify(foundUser))
      } else {
        sessionStorage.setItem('asplan_user', JSON.stringify(foundUser))
      }

      toast({
        title: 'Login realizado',
        description: `Bem-vindo, ${foundUser.name}!`,
      })
      return true
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao tentar fazer login.',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('asplan_user')
    sessionStorage.removeItem('asplan_user')
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
    isLoading,
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
