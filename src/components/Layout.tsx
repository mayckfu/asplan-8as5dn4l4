import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { Header } from '@/components/Header'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const AppLayout = () => {
  const { state, isMobile } = useSidebar()

  return (
    <div
      className={cn(
        'grid min-h-screen w-full',
        !isMobile && state === 'expanded' && 'md:grid-cols-[240px_1fr]',
        !isMobile && state === 'collapsed' && 'md:grid-cols-[72px_1fr]',
        'transition-all duration-300 ease-in-out',
      )}
    >
      <AppSidebar />
      <div className="flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 animate-fade-in overflow-y-auto bg-background">
          <div className="max-w-screen-2xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Layout() {
  return (
    <SidebarProvider>
      <AppLayout />
    </SidebarProvider>
  )
}
