import * as React from 'react'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button, ButtonProps } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

type SidebarContextProps = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export function useSidebar(): SidebarContextProps {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export const SidebarProvider: React.FC<
  React.PropsWithChildren<{
    defaultOpen?: boolean
  }>
> = ({ children, defaultOpen = true }) => {
  const isMobile = useIsMobile()
  const [open, setOpenState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sb_collapsed')
      return stored ? JSON.parse(stored) === false : defaultOpen
    }
    return defaultOpen
  })
  const [openMobile, setOpenMobile] = useState(false)

  const setOpen = (value: boolean) => {
    setOpenState(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sb_collapsed', JSON.stringify(!value))
    }
  }

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev)
    } else {
      setOpen(!open)
    }
  }, [isMobile, open, setOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '[') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const state = open ? 'expanded' : 'collapsed'

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  'bg-muted/40 border-r flex-col transition-all duration-300 ease-in-out',
  {
    variants: {
      state: {
        expanded: 'w-60',
        collapsed: 'w-[72px]',
      },
    },
    defaultVariants: {
      state: 'expanded',
    },
  },
)

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <>
        {openMobile && (
          <div
            className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
            onClick={() => setOpenMobile(false)}
          />
        )}
        <div
          ref={ref}
          className={cn(
            'fixed top-0 left-0 h-full w-60 bg-background z-50 flex flex-col transition-transform duration-300 ease-in-out',
            openMobile ? 'translate-x-0' : '-translate-x-full',
            className,
          )}
          {...props}
        />
      </>
    )
  }

  return (
    <div
      ref={ref}
      className={cn('hidden md:flex', sidebarVariants({ state }), className)}
      {...props}
    />
  )
})
Sidebar.displayName = 'Sidebar'

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar, isMobile } = useSidebar()
    if (isMobile) return null
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn('hidden md:flex', className)}
        onClick={toggleSidebar}
        {...props}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
    )
  },
)
SidebarTrigger.displayName = 'SidebarTrigger'

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto', className)}
    {...props}
  />
))
SidebarContent.displayName = 'SidebarContent'

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-16 items-center border-b shrink-0',
        state === 'expanded' ? 'px-6' : 'px-0 justify-center',
        className,
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = 'SidebarHeader'

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-auto p-4', className)} {...props} />
))
SidebarFooter.displayName = 'SidebarFooter'

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar()
  return (
    <nav
      ref={ref}
      className={cn(
        'grid items-start text-sm font-medium gap-1',
        state === 'expanded' ? 'px-4' : 'px-2',
        className,
      )}
      {...props}
    />
  )
})
SidebarMenu.displayName = 'SidebarMenu'

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>((props, ref) => <li ref={ref} {...props} />)
SidebarMenuItem.displayName = 'SidebarMenuItem'

interface SidebarMenuButtonProps extends ButtonProps {
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, tooltip, children, ...props }, ref) => {
  const { state, isMobile, setOpenMobile } = useSidebar()

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (isMobile) setOpenMobile(false)
    props.onClick?.(event)
  }

  const buttonContent = (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-600 transition-all hover:text-primary w-full justify-start',
        { 'bg-muted text-primary': isActive },
        state === 'collapsed' && !isMobile && 'justify-center',
        className,
      )}
      {...props}
      onClick={handleClick}
    >
      {children}
    </Button>
  )

  if (state === 'collapsed' && tooltip && !isMobile) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent side="right">
          {typeof tooltip === 'string' ? <p>{tooltip}</p> : tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }

  return buttonContent
})
SidebarMenuButton.displayName = 'SidebarMenuButton'
