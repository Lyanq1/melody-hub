'use client'
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './reset-password.css'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AUTH_ENDPOINTS } from '@/lib/config'

const ResetPasswordPage = () => {
  const [username, setUsername] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', '']) // 6 digits
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('code') // 'code' or 'password'
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  
  // Get email and username from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email')
    const usernameParam = urlParams.get('username')
    if (email) {
      setUserEmail(email)
    }
    if (usernameParam) {
      setUsername(usernameParam)
    }
  }, [])
  
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-focus next input when typing code
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    // Move to next input if value entered
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace in code inputs
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const codeString = code.join('')
    
    if (codeString.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    if (!username) {
      toast.error('Username is required')
      return
    }

    setIsLoading(true)

    try {
      // Verify code with backend
      await axios.post(AUTH_ENDPOINTS.VERIFY_RESET_CODE, {
        username,
        token: codeString
      })
      
      setCurrentStep('password')
      toast.success('Code verified! Please set your new password.')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Invalid code')
      } else {
        toast.error('Invalid code')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      await axios.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
        username,
        token: code.join(''),
        newPassword
      })
      
      toast.success('Password reset successfully!')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to reset password')
      } else {
        toast.error('Failed to reset password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='reset-password-container'>
      {/* Header */}
      <div className='header'>
        <Link href='/forgot-password' className='back-button'>
          <span>←</span>
        </Link>
        <h1 className='page-title'>
          {currentStep === 'code' ? 'Check your email' : 'Set a new password'}
        </h1>
      </div>

      {/* Main Content */}
      <div className='main-content'>
        {currentStep === 'code' ? (
          <>
            <p className='instruction-text'>
              We sent a reset link to <strong>{userEmail || 'your email'}</strong>. 
              Enter the 6-digit code that mentioned in the email.
            </p>
            
            <form onSubmit={handleVerifyCode} className='code-form'>
              <div className='code-inputs'>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      codeRefs.current[index] = el;
                    }}
                    type='text'
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className='code-input'
                    inputMode='numeric'
                    pattern='[0-9]*'
                  />
                ))}
              </div>

              <button 
                type='submit' 
                disabled={isLoading || code.join('').length !== 6} 
                className='verify-button'
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className='resend-section'>
              <span className='resend-text'>Haven't got the email yet? </span>
              <button className='resend-link'>Resend email</button>
            </div>
          </>
        ) : (
          <>
            <p className='instruction-text'>
              Create a new password. Ensure it differs from previous ones for security.
            </p>
            
            <form onSubmit={handleResetPassword} className='password-form'>
              <div className='input-group'>
                <label className='input-label'>Password</label>
                <div className='password-input-container'>
                  <input
                    className='password-input'
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder='Enter your new password'
                    required
                  />
                  <button
                    type='button'
                    className='password-toggle'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className='input-group'>
                <label className='input-label'>Confirm Password</label>
                <div className='password-input-container'>
                  <input
                    className='password-input'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Re-enter password'
                    required
                  />
                  <button
                    type='button'
                    className='password-toggle'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button 
                type='submit' 
                disabled={isLoading} 
                className='update-button'
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage