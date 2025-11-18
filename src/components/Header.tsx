import { Link } from 'react-router-dom'
import { Menu, User, ChevronLeft, Bell, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'

export const Header = () => {
  const { toggleSidebar, state, isMobile, setOpenMobile } = useSidebar()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/80 px-6 z-30 shadow-sm backdrop-blur-md transition-all">
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
          <span className="font-semibold text-lg text-foreground hidden md:block leading-tight">
            Controle de Emendas
          </span>
          <span className="text-xs text-muted-foreground hidden md:block">
            Secretaria de Saúde
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          <span className="sr-only">Notificações</span>
        </Button>

        <div className="h-6 w-px bg-border/50 mx-1" />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full border border-border/50 bg-muted/50 hover:bg-muted"
            >
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Menu do usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'email@asplan.gov'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
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
