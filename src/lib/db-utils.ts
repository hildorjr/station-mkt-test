import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Get Supabase client for client-side operations
 */
export function getBrowserSupabase(): SupabaseClient<Database> {
  return createBrowserClient()
}

/**
 * Generic error handler for database operations
 */
export function handleDatabaseError(error: unknown): {
  success: false
  error: string
} {
  console.error('Database error:', error)
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return { success: false, error: error.message }
  }
  
  return { success: false, error: 'An unexpected database error occurred' }
}

/**
 * Generic success handler for database operations
 */
export function handleDatabaseSuccess<T>(data: T): {
  success: true
  data: T
} {
  return { success: true, data }
}

/**
 * Database response type
 */
export type DatabaseResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
