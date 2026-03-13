import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-middleware'

export default auth((req) => {
  const isAuthenticated = Boolean(req.auth?.user)
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard')
  const isLoginRoute = req.nextUrl.pathname.startsWith('/login')

  if (isDashboardRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
