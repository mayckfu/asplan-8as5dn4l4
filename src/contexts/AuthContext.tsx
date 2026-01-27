import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { User, UserRole } from '@/lib/mock-data'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  login: (
    email: string,
    password?: string,
    rememberMe?: boolean,
  ) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  session: Session | null
  checkPermission: (requiredRoles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error.message)
      }

      if (data) {
        setUser(data as User)
      }
    } catch (error: any) {
      console.error('Unexpected error fetching profile:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (
    email: string,
    password?: string,
    rememberMe: boolean = false,
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      if (!password) {
        throw new Error('Senha é obrigatória')
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast({
        title: 'Login realizado',
        description: 'Bem-vindo ao sistema!',
      })
      return true
    } catch (error: any) {
      console.error('Login error:', error.message)
      toast({
        title: 'Erro de login',
        description: error.message || 'Credenciais inválidas.',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      toast({
        title: 'Logout',
        description: 'Você saiu do sistema.',
      })
    } catch (error: any) {
      console.error('Logout error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const checkPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false
    return requiredRoles.includes(user.role)
  }

  const value = {
    user,
    session,
    login,
    logout,
    isAuthenticated: !!session && !!user,
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    checkPermission,
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
