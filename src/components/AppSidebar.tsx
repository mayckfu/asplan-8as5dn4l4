import { Link, useLocation } from 'react-router-dom'
import { Home, List, BarChart2, Package2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/emendas', label: 'Emendas', icon: List },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/importacao', label: 'Importação', icon: Upload },
]

export const AppSidebar = () => {
  const { pathname } = useLocation()

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6 text-primary" />
            <span>Controle de Emendas</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                to={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  { 'bg-muted text-primary': pathname === href },
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="text-center text-xs text-muted-foreground">
            <Badge variant="outline">Admin</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
