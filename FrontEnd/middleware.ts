import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Với localStorage, middleware (chạy server-side) không thể đọc token.
// Do đó, ta không chặn ở đây nữa; việc kiểm tra sẽ do client (ProtectedRoute/useAuth) đảm nhận.
export function middleware() {
  return NextResponse.next()
}

export const config = {}
