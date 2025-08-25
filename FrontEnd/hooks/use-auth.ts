import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface User {
  accountID: string
  username: string
  email: string
  displayName: string
  avatarURL?: string
  role: 'Customer' | 'Admin' | 'Artist'
  phone?: string
  address?: string
}

interface AuthState {
  user: User | null
  isAdmin: boolean
  isArtist: boolean
  isCustomer: boolean
  isLoading: boolean
  isAuthenticated: boolean
}

const API_BASE_URL = 'http://localhost:5000/api'

export const useAuth = (): AuthState & {
  login: (token: string, user: User) => void
  logout: () => void
  checkDashboardAccess: () => Promise<boolean>
  refreshUserInfo: () => Promise<void>
} => {
  const { data: session, status } = useSession()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isArtist: false,
    isCustomer: false,
    isLoading: true,
    isAuthenticated: false
  })

  // Kiểm tra authentication khi component mount hoặc session thay đổi
  useEffect(() => {
    checkAuthStatus()
  }, [session, status])

  // Lắng nghe profile updates từ profile page
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const updatedUser = event.detail
      console.log('👤 Received profile update:', updatedUser)

      setAuthState((prev) => ({
        ...prev,
        user: updatedUser
      }))
    }

    window.addEventListener('user-profile-updated', handleProfileUpdate as EventListener)

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate as EventListener)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Kiểm tra session loading state
      if (status === 'loading') {
        setAuthState((prev) => ({ ...prev, isLoading: true }))
        return
      }

      // Kiểm tra NextAuth session trước
      if (session?.user) {
        console.log('🔍 NextAuth session found:', session.user)
        const sessionUser = session.user as any

        // Nếu có thông tin backend user từ session
        if (sessionUser.backendUser) {
          const user = sessionUser.backendUser
          console.log('✅ Using backend user from NextAuth session:', user)

          setAuthState({
            user,
            isAdmin: user.role === 'Admin',
            isArtist: user.role === 'Artist',
            isCustomer: user.role === 'Customer',
            isLoading: false,
            isAuthenticated: true
          })
          return
        }

        // Nếu chưa có backend user, tạo user object từ session
        const userFromSession: User = {
          accountID: sessionUser.accountID || '',
          username: sessionUser.username || sessionUser.email?.split('@')[0] || '',
          email: sessionUser.email || '',
          displayName: sessionUser.name || '',
          avatarURL: sessionUser.image || '',
          role: sessionUser.role || 'Customer'
        }

        console.log('✅ Using user from NextAuth session:', userFromSession)
        setAuthState({
          user: userFromSession,
          isAdmin: userFromSession.role === 'Admin',
          isArtist: userFromSession.role === 'Artist',
          isCustomer: userFromSession.role === 'Customer',
          isLoading: false,
          isAuthenticated: true
        })
        return
      }

      // Fallback: Kiểm tra traditional token authentication
      const token = localStorage.getItem('token')
      console.log('🔍 Checking traditional auth token:', token ? 'Present' : 'Missing')

      if (!token) {
        console.log('❌ No token found, setting unauthenticated state')
        setAuthState({
          user: null,
          isAdmin: false,
          isArtist: false,
          isCustomer: false,
          isLoading: false,
          isAuthenticated: false
        })
        return
      }

      // Kiểm tra token với backend
      console.log('🔐 Validating token with backend...')
      console.log('🔑 Token being sent:', token ? token.substring(0, 20) + '...' : 'none')
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })

      console.log('📡 Backend response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        const user = data.user
        console.log('✅ Token valid, user data:', user)
        console.log('👑 User role:', user.role)

        setAuthState({
          user,
          isAdmin: user.role === 'Admin',
          isArtist: user.role === 'Artist',
          isCustomer: user.role === 'Customer',
          isLoading: false,
          isAuthenticated: true
        })
      } else {
        // Token không hợp lệ, xóa khỏi localStorage
        console.log('❌ Token invalid, clearing localStorage')
        localStorage.removeItem('token')
        localStorage.removeItem('username')

        setAuthState({
          user: null,
          isAdmin: false,
          isArtist: false,
          isCustomer: false,
          isLoading: false,
          isAuthenticated: false
        })
      }
    } catch (error) {
      console.error('💥 Error checking auth status:', error)
      setAuthState({
        user: null,
        isAdmin: false,
        isArtist: false,
        isCustomer: false,
        isLoading: false,
        isAuthenticated: false
      })
    }
  }

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('username', user.username)

    setAuthState({
      user,
      isAdmin: user.role === 'Admin',
      isArtist: user.role === 'Artist',
      isCustomer: user.role === 'Customer',
      isLoading: false,
      isAuthenticated: true
    })
  }

  const logout = async () => {
    // Logout from NextAuth session
    if (session) {
      await signOut({ redirect: false })
    }

    // Clear traditional auth
    localStorage.removeItem('token')
    localStorage.removeItem('username')

    setAuthState({
      user: null,
      isAdmin: false,
      isArtist: false,
      isCustomer: false,
      isLoading: false,
      isAuthenticated: false
    })
  }

  const checkDashboardAccess = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        return false
      }

      const response = await fetch(`${API_BASE_URL}/auth/dashboard/access`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })

      if (response.ok) {
        const data = await response.json()
        return data.canAccess
      }

      return false
    } catch (error) {
      console.error('Error checking dashboard access:', error)
      return false
    }
  }

  const refreshUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })

      if (response.ok) {
        const data = await response.json()
        const user = data.user

        setAuthState((prev) => ({
          ...prev,
          user,
          isAdmin: user.role === 'Admin',
          isArtist: user.role === 'Artist',
          isCustomer: user.role === 'Customer'
        }))
      }
    } catch (error) {
      console.error('Error refreshing user info:', error)
    }
  }

  return {
    ...authState,
    login,
    logout,
    checkDashboardAccess,
    refreshUserInfo
  }
}
