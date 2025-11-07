import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768 // md breakpoint

/**
 * Custom hook to check if the user is on a mobile device
 * @returns {boolean} - True if the user is on a mobile device, false otherwise
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return isMobile
}
