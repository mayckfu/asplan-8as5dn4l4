import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { User, mockUsers } from '@/lib/mock-data'
import { useToast } from '@/components/ui/use-toast'

interface AuthContextType {
  user: User | null
  login: (email: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Simulate session persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('asplan_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // Default login as Admin for demo purposes if no session
      // In a real app, this would be null
      const defaultAdmin = mockUsers.find((u) => u.role === 'ADMIN')
      if (defaultAdmin) {
        setUser(defaultAdmin)
        localStorage.setItem('asplan_user', JSON.stringify(defaultAdmin))
      }
    }
  }, [])

  const login = async (email: string) => {
    const foundUser = mockUsers.find(
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
