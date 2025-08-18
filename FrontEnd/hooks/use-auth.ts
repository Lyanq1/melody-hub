import { useState, useEffect } from 'react'

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

// Helper functions để làm việc với cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

export const useAuth = (): AuthState & {
  login: (token: string, user: User) => void
  logout: () => void
  checkDashboardAccess: () => Promise<boolean>
  refreshUserInfo: () => Promise<void>
} => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isArtist: false,
    isCustomer: false,
    isLoading: true,
    isAuthenticated: false
  })

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = getCookie('token')
      console.log('🔍 Checking auth status, token:', token ? 'Present' : 'Missing')
      
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
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        // Token không hợp lệ, xóa khỏi cookies
        console.log('❌ Token invalid, clearing cookies')
        removeCookie('token')
        removeCookie('username')
        
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
    setCookie('token', token, 7) // Lưu token trong 7 ngày
    setCookie('username', user.username, 7)
    
    setAuthState({
      user,
      isAdmin: user.role === 'Admin',
      isArtist: user.role === 'Artist',
      isCustomer: user.role === 'Customer',
      isLoading: false,
      isAuthenticated: true
    })
  }

  const logout = () => {
    removeCookie('token')
    removeCookie('username')
    
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
      const token = getCookie('token')
      
      if (!token) {
        return false
      }

      const response = await fetch(`${API_BASE_URL}/auth/dashboard/access`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const token = getCookie('token')
      
      if (!token) {
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const user = data.user
        
        setAuthState(prev => ({
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
