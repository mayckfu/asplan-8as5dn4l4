import { Link } from 'react-router-dom'
import { Menu, User, ChevronLeft } from 'lucide-react'
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

export const Header = () => {
  const { toggleSidebar, state, isMobile, setOpenMobile } = useSidebar()

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-card/90 px-4 md:px-6 z-30 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-4">
        {isMobile ? (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
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
            className="shrink-0"
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform duration-300',
                state === 'expanded' ? 'rotate-0' : 'rotate-180',
              )}
            />
          </Button>
        )}
        <Link to="/" className="flex items-center">
          <img
            src="/asplan-logo.png"
            alt=""
            aria-hidden="true"
            className="h-7 w-auto mr-2"
          />
          <span className="font-semibold text-lg text-asplan-deep dark:text-neutral-200 hidden md:block">
            ASPLAN — Controle de Emendas Parlamentares
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
