import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { Header } from '@/components/Header'

export default function Layout() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      <AppSidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 animate-fade-in">
          <div className="max-w-screen-2xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
