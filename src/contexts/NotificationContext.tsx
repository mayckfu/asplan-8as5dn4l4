import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'
import { useToast } from '@/components/ui/use-toast'

export type Notification = {
  id: string
  user_id: string
  emenda_id: string
  message: string
  is_read: boolean
  created_at: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  loading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotifications(data as Notification[])
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()

    if (user) {
      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification
            setNotifications((prev) => [newNotification, ...prev])
            toast({
              title: 'Nova Notificação',
              description: newNotification.message,
            })
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, fetchNotifications, toast])

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

      toast({
        title: 'Notificações',
        description: 'Todas as notificações marcadas como lidas.',
      })
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    )
  }
  return context
}
