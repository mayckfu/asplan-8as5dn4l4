import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/ThemeProvider'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import EmendasListPage from './pages/emendas/EmendasListPage'
import EmendaDetailPage from './pages/emendas/EmendaDetailPage'
import RelatoriosPage from './pages/RelatoriosPage'
import ImportacaoPage from './pages/ImportacaoPage'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/emendas" element={<EmendasListPage />} />
            <Route path="/emenda/:id" element={<EmendaDetailPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/importacao" element={<ImportacaoPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
