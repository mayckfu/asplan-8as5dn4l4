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
        'grid min-h-screen w-full bg-background',
        !isMobile && state === 'expanded' && 'md:grid-cols-[260px_1fr]',
        !isMobile && state === 'collapsed' && 'md:grid-cols-[72px_1fr]',
        'transition-all duration-300 ease-in-out',
      )}
    >
      <AppSidebar />
      <div className="flex flex-col overflow-hidden h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto bg-neutral-50/50 dark:bg-background scroll-smooth">
          <div className="max-w-[1600px] mx-auto px-6 py-8 w-full">
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
