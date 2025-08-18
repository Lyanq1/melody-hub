import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Authentication utilities
export const getCurrentUserId = (): string | null => {
  try {
    // Check if running in a browser environment
    if (typeof window === "undefined") {
      return null; // Return null during SSR
    }

    const token = window.localStorage.getItem('token')
    if (!token) return null
    
    // Decode JWT token to get accountID
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.accountID
  } catch (error) {
    console.error('Error getting user ID:', error)
    return null
  }
}

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") {
    return false; // Return false during SSR
  }

  const token = window.localStorage.getItem('token')
  return !!token
}

export const getCurrentUser = () => {
  if (typeof window === "undefined") {  
    return null; // Return null during SSR
  }

  try {
    const token = window.localStorage.getItem('token')
    if (!token) return null
    
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      accountID: payload.accountID,
      username: payload.username,
      role: payload.role
    }
  } catch (error) {
    console.error('Error getting user info:', error)
    return null
  }
}