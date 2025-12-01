import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPercent(
  value: number,
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...options,
  }).format(value / 100)
}

export function parseCurrencyBRL(value: string): number {
  if (!value) return 0
  // If input is already a number type (edge case), return it
  if (typeof value === 'number') return value

  // Remove "R$", whitespace, and dots (thousand separators)
  const cleanValue = value.toString().replace(/[R$\s.]/g, '')
  // Replace comma with dot for decimal
  const dotValue = cleanValue.replace(',', '.')
  const number = parseFloat(dotValue)
  return isNaN(number) ? 0 : number
}
