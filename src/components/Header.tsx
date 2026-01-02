import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  ChevronLeft,
  Bell,
  LogOut,
  Check,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatNotificationDate } from '@/lib/date-utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const Header = () => {
  const navigate = useNavigate()
  const { toggleSidebar, state, isMobile, setOpenMobile } = useSidebar()
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotification()

  const handleNotificationClick = async (id: string, emendaId: string) => {
    await markAsRead(id)
    navigate(`/emenda/${emendaId}`)
  }

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b border-border bg-white px-6 z-30 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-muted"
            onClick={() => setOpenMobile(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform duration-300',
                state === 'expanded' ? 'rotate-0' : 'rotate-180',
              )}
            />
          </Button>
        )}
        <div className="flex flex-col">
          <span className="font-bold text-lg text-brand-900 hidden md:block leading-tight tracking-tight">
            CONTROLE DE EMENDAS
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-xl px-8 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-600 transition-colors" />
          <Input
            placeholder="Buscar por proposta, emenda ou parlamentar..."
            className="pl-10 h-10 rounded-full bg-neutral-50 border-transparent focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-brand-700 hover:bg-brand-50"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-white animate-pulse" />
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 shadow-float border-border"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-neutral-50/50">
              <span className="font-semibold text-sm text-brand-900">
                Notificações
              </span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-brand-600 hover:text-brand-800"
                  onClick={(e) => {
                    e.preventDefault()
                    markAllAsRead()
                  }}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  <p>Nenhuma notificação nova.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'w-full relative group border-b border-border/50 last:border-0 transition-colors',
                        !notification.is_read
                          ? 'bg-brand-50/40'
                          : 'hover:bg-neutral-50',
                      )}
                    >
                      <button
                        className="w-full text-left px-4 py-3 flex items-start gap-3"
                        onClick={() =>
                          handleNotificationClick(
                            notification.id,
                            notification.emenda_id,
                          )
                        }
                      >
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full mt-1.5 shrink-0 transition-colors',
                            !notification.is_read
                              ? 'bg-brand-500'
                              : 'bg-transparent',
                          )}
                        />
                        <div className="flex flex-col gap-1 flex-1">
                          <p
                            className={cn(
                              'text-sm leading-snug',
                              !notification.is_read
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground',
                            )}
                          >
                            {notification.message}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {formatNotificationDate(notification.created_at)}
                          </span>
                        </div>
                      </button>
                      {!notification.is_read && (
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                              >
                                <Check className="h-3 w-3 text-muted-foreground" />
                                <span className="sr-only">
                                  Marcar como lida
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Marcar como lida</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full border border-border bg-neutral-100 hover:bg-white hover:shadow-sm transition-all"
            >
              <UserIcon className="h-5 w-5 text-brand-700" />
              <span className="sr-only">Menu do usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-float">
            <DropdownMenuLabel className="font-normal bg-brand-50/50 p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-brand-900">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'email@asplan.gov'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
