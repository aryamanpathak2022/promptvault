import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = req.cookies.get('next-auth.session-token') || 
                         req.cookies.get('__Secure-next-auth.session-token')
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
