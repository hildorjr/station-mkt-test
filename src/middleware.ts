import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/audiences',
    '/audiences/:path*',
    '/concepts',
    '/concepts/:path*',
  ],
}
