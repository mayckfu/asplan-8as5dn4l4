// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string

// Custom storage to support Remember Me functionality per user session securely
const customStorage = {
  getItem: (key: string): string | null => {
    return localStorage.getItem(key) || sessionStorage.getItem(key)
  },
  setItem: (key: string, value: string): void => {
    const rememberMe = localStorage.getItem('asplan_remember_me') === 'true'
    if (rememberMe) {
      localStorage.setItem(key, value)
      sessionStorage.removeItem(key)
    } else {
      sessionStorage.setItem(key, value)
      localStorage.removeItem(key)
    }
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

// Import the supabase client like this:
// import { supabase } from "@/lib/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: customStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)
