import { Link, useLocation } from 'react-router-dom'
import { Home, List, BarChart2, Package2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/emendas', label: 'Emendas', icon: List },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/importacao', label: 'Importação', icon: Upload },
]

export const AppSidebar = () => {
  const { pathname } = useLocation()
  const { state, isMobile } = useSidebar()
  const isExpanded = isMobile || state === 'expanded'

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-neutral-800"
        >
          <Package2 className="h-6 w-6 text-primary" />
          {isExpanded && <span>Controle de Emendas</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === href}
                tooltip={label}
              >
                <Link to={href}>
                  <Icon className="h-4 w-4" />
                  {isExpanded && <span>{label}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div
          className={cn(
            'text-center text-xs text-neutral-600',
            !isExpanded && 'hidden',
          )}
        >
          <Badge variant="outline">Admin</Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
