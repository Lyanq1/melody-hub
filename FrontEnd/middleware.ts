import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  console.log('🔒 Middleware checking:', { pathname, hasToken: !!token })

  // Kiểm tra nếu đang truy cập vào dashboard hoặc admin
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!token) {
      console.log('❌ No token found, redirecting to login')
      // Nếu không có token, redirect về login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Decode JWT token để kiểm tra role
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('🔐 Token payload:', { role: payload.role, exp: payload.exp })
      
      // Kiểm tra token hết hạn
      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < currentTime) {
        console.log('❌ Token expired, redirecting to login')
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      // Dashboard và Admin đều yêu cầu role Admin
      if (pathname.startsWith('/admin') && payload.role !== 'Admin') {
        console.log('❌ Admin access denied - role:', payload.role)
        // Nếu truy cập admin mà không phải Admin, redirect về homepage
        return NextResponse.redirect(new URL('/', request.url))
      }
      
      if (pathname.startsWith('/dashboard') && payload.role !== 'Admin') {
        console.log('❌ Dashboard access denied - role:', payload.role)
        // Dashboard chỉ cho phép Admin truy cập
        return NextResponse.redirect(new URL('/', request.url))
      }

      console.log('✅ Access granted for:', pathname)
    } catch (error) {
      console.error('💥 Error parsing token:', error)
      // Nếu token không hợp lệ, redirect về login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*'
  ]
}
