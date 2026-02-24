import { createContext, useContext, useState, ReactNode } from 'react'

interface YearContextType {
  selectedYear: string
  setSelectedYear: (year: string) => void
}

const YearContext = createContext<YearContextType | undefined>(undefined)

export const YearProvider = ({ children }: { children: ReactNode }) => {
  const [selectedYear, setSelectedYearState] = useState(() => {
    return (
      localStorage.getItem('app_selected_year') ||
      localStorage.getItem('asplan_dashboard_year') ||
      new Date().getFullYear().toString()
    )
  })

  const setSelectedYear = (year: string) => {
    localStorage.setItem('app_selected_year', year)
    localStorage.setItem('asplan_dashboard_year', year)
    setSelectedYearState(year)
  }

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  )
}

export const useYear = () => {
  const context = useContext(YearContext)
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider')
  }
  return context
}
