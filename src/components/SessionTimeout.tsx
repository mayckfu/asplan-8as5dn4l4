import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Timer, AlertTriangle } from 'lucide-react'

// Time in milliseconds
const INACTIVITY_LIMIT = 60 * 60 * 1000 // 60 minutes
const WARNING_LIMIT = 50 * 60 * 1000 // 50 minutes (10 minutes before logout)
const CHECK_INTERVAL = 1000 // Check every second

export const SessionTimeout = () => {
  const { logout, isAuthenticated } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // Use refs to keep track of state without triggering re-renders of listeners
  const lastActivityRef = useRef<number>(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleActivity = useCallback(() => {
    // Only update activity timestamp if we are NOT in warning state
    // This forces the user to explicitly click "Renew" if warning is shown
    if (!showWarning) {
      lastActivityRef.current = Date.now()
    }
  }, [showWarning])

  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    // Start checking timer
    timerRef.current = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityRef.current

      // Calculate remaining time for the warning countdown
      const remaining = Math.max(
        0,
        Math.ceil((INACTIVITY_LIMIT - timeSinceLastActivity) / 1000),
      )
      setTimeLeft(remaining)

      if (timeSinceLastActivity >= INACTIVITY_LIMIT) {
        // Time expired
        clearInterval(timerRef.current!)
        window.removeEventListener('mousemove', handleActivity) // Clean up
        handleLogout()
      } else if (timeSinceLastActivity >= WARNING_LIMIT) {
        // Show warning
        if (!showWarning) {
          setShowWarning(true)
        }
      }
    }, CHECK_INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [isAuthenticated, handleActivity, showWarning])

  const handleLogout = async () => {
    setShowWarning(false)
    await logout()
    window.location.href = '/login'
  }

  const handleRenewSession = () => {
    lastActivityRef.current = Date.now()
    setShowWarning(false)
  }

  // Format countdown minutes:seconds
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <Dialog
      open={showWarning}
      onOpenChange={(open) => {
        // Prevent closing by clicking outside or escape, enforce action
        if (!open && timeLeft > 0) return
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <AlertTriangle className="h-6 w-6" />
            <DialogTitle className="text-xl">
              Sessão Prestes a Expirar
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-neutral-600">
            Sua sessão irá expirar em{' '}
            <span className="font-bold text-amber-700">
              {formatTime(timeLeft)}
            </span>{' '}
            devido à inatividade.
            <br />
            Para manter sua conta segura, você será desconectado
            automaticamente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="sm:w-auto w-full"
          >
            Sair Agora
          </Button>
          <Button
            onClick={handleRenewSession}
            className="sm:w-auto w-full gap-2 font-semibold"
          >
            <Timer className="h-4 w-4" />
            Renovar Sessão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
