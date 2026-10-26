import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname
  const token = req.cookies.get('sb-access-token') || req.cookies.get('supabase-auth-token')
  
  // Protect all dashboards - Must login!
  const protectedRoutes = ['/dashboard', '/registrar', '/student', '/lecturer', '/exam-officer', '/hod', '/provost', '/bursar', '/admin']
  
  const isProtected = protectedRoutes.some(route => url.startsWith(route))
  
  if (isProtected && !token) {
    // No login -> Redirect to login page!
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/registrar/:path*', '/student/:path*', '/lecturer/:path*', '/exam-officer/:path*', '/hod/:path*', '/provost/:path*', '/bursar/:path*', '/admin/:path*']
}
