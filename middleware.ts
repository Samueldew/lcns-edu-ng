import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl.pathname

    // Protect all dashboards
    const protectedRoutes = [
      '/dashboard',
      '/registrar',
      '/student',
      '/lecturer',
      '/exam-officer',
      '/hod',
      '/provost',
      '/bursar',
      '/admin'
    ]

    const isProtected = protectedRoutes.some(route => url.startsWith(route))
    
    if (!isProtected) {
      return NextResponse.next()
    }

    // Supabase now uses sb-<project_id>-auth-token format
    // Check ALL possible auth cookies
    const allCookies = req.cookies.getAll()
    const hasAuthToken = allCookies.some(c => 
      c.name.includes('sb-') && c.name.includes('auth-token') ||
      c.name === 'sb-access-token' ||
      c.name === 'supabase-auth-token' ||
      c.name.includes('access-token')
    )

    if (!hasAuthToken) {
      // No login -> Redirect to login
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', url) // remember where he wanted to go
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
    
  } catch (err) {
    console.error('Middleware error:', err)
    // NEVER crash the site - just allow the request
    // The page itself will handle auth
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/registrar/:path*',
    '/student/:path*',
    '/lecturer/:path*',
    '/exam-officer/:path*',
    '/hod/:path*',
    '/provost/:path*',
    '/bursar/:path*',
    '/admin/:path*'
  ]
}
