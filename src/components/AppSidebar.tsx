import { Link, useLocation } from 'react-router-dom'
import { Home, FileText, BarChart2, Settings, ChevronRight } from 'lucide-react'
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
  { href: '/emendas', label: 'Emendas', icon: FileText },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/admin', label: 'Admin', icon: Settings },
]

export const AppSidebar = () => {
  const { pathname } = useLocation()
  const { state } = useSidebar()
  const isExpanded = state === 'expanded'

  return (
    <Sidebar className="border-r border-border/50 bg-card shadow-sm z-40">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50 px-4">
        <div className="flex items-center gap-2 overflow-hidden w-full">
          <img
            src="/asplan-logo.png"
            alt="ASPLAN Logo"
            className="h-8 w-auto object-contain"
          />
          {isExpanded && (
            <span className="font-bold text-lg text-asplan-deep truncate">
              ASPLAN
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarMenu className="space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={label}
                  className={cn(
                    'w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-asplan-primary/10 text-asplan-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Link to={href} className="flex items-center w-full">
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-asplan-primary'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                    {isExpanded && (
                      <span className="flex-1 truncate">{label}</span>
                    )}
                    {isExpanded && isActive && (
                      <ChevronRight className="h-4 w-4 text-asplan-primary ml-auto" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
        {isExpanded ? (
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-asplan-primary/10 flex items-center justify-center text-asplan-primary font-bold text-xs">
              AD
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">Admin User</span>
              <span className="text-xs text-muted-foreground truncate">
                admin@asplan.gov
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-asplan-primary/10 flex items-center justify-center text-asplan-primary font-bold text-xs">
              AD
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
