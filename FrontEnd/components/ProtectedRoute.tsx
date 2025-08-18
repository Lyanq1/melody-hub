'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireDashboard?: boolean
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireDashboard = false,
  fallback
}: ProtectedRouteProps) {
  const { user, isAdmin, isAuthenticated, isLoading, checkDashboardAccess } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      console.log('🔒 ProtectedRoute checking access:', {
        isLoading,
        isAuthenticated,
        isAdmin,
        requireAdmin,
        requireDashboard,
        user: user ? { username: user.username, role: user.role } : null
      })

      // Đợi cho đến khi không còn loading
      if (isLoading) {
        console.log('⏳ Still loading, waiting...')
        return
      }

      // Kiểm tra xác thực
      if (!isAuthenticated) {
        console.log('❌ Not authenticated, redirecting to login')
        router.push('/login')
        return
      }

      // Kiểm tra quyền Admin nếu cần
      if (requireAdmin && !isAdmin) {
        console.log('❌ Admin access denied - not admin')
        router.push('/')
        return
      }

      // Kiểm tra quyền Dashboard
      if (requireDashboard) {
        if (!isAdmin) {
          console.log('❌ Dashboard access denied - not admin')
          router.push('/')
          return
        }

        // Kiểm tra thêm với backend
        console.log('🔐 Checking dashboard access with backend...')
        try {
          const canAccess = await checkDashboardAccess()
          if (!canAccess) {
            console.log('❌ Backend denied dashboard access')
            router.push('/')
            return
          }
          console.log('✅ Backend approved dashboard access')
          setHasAccess(true)
        } catch (error) {
          console.error('💥 Error checking dashboard access:', error)
          router.push('/')
          return
        }
      } else {
        console.log('✅ Access granted')
        setHasAccess(true)
      }
    }

    checkAccess()
  }, [isAuthenticated, isAdmin, isLoading, requireAdmin, requireDashboard, checkDashboardAccess, router, user])

  // Hiển thị loading state
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Loading state')
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // Kiểm tra quyền truy cập cuối cùng
  const canAccess = isAuthenticated && 
    (!requireAdmin || isAdmin) && 
    (!requireDashboard || hasAccess !== false)

  console.log('🔒 ProtectedRoute final access check:', {
    canAccess,
    isAuthenticated,
    requireAdmin,
    isAdmin,
    requireDashboard,
    hasAccess
  })

  if (!canAccess) {
    console.log('❌ Access denied, showing fallback')
    return fallback || null
  }

  console.log('✅ Access granted, rendering children')
  return <>{children}</>
}
