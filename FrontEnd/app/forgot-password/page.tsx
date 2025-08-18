'use client'
import React, { useState } from 'react'
import axios from 'axios'
import './forgot-password.css'
import { toast } from 'sonner'
import Link from 'next/link'
import { AUTH_ENDPOINTS } from '@/lib/config'

const ForgotPasswordPage = () => {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log('Sending request to:', AUTH_ENDPOINTS.FORGOT_PASSWORD)
    console.log('Request data:', { username })

    try {
      const response = await axios.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { username })
      console.log('Response:', response.data)
      setUserEmail(response.data.email)
      setEmailSent(true)
      toast.success('Reset code sent to your email!')
    } catch (err) {
      console.error('Error details:', err)
      if (axios.isAxiosError(err)) {
        console.error('Axios error response:', err.response?.data)
        console.error('Axios error status:', err.response?.status)
        toast.error(err.response?.data?.message || 'Failed to send reset code')
      } else {
        toast.error('Failed to send reset code')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='forgot-password-container'>
      {/* Header */}
      <div className='header'>
        <Link href='/login' className='back-button'>
          <span>←</span>
        </Link>
        <h1 className='page-title'>Forgot password</h1>
      </div>

      {/* Main Content */}
      <div className='main-content'>
        {!emailSent ? (
          <>
            <p className='instruction-text'>
              Please enter your username to reset the password
            </p>
            
            <form onSubmit={handleRequestReset} className='reset-form'>
              <div className='input-group'>
                <label className='input-label'>Your Username</label>
                <input
                  className='input-field'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder='Enter your username'
                  required
                />
              </div>

              <button 
                type='submit' 
                disabled={isLoading} 
                className='reset-button'
              >
                {isLoading ? 'Sending...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div className='success-container'>
            <div className='success-icon'>✓</div>
            <h2 className='success-title'>Code Sent!</h2>
            <p className='success-message'>
              We've sent a 6-digit reset code to: <strong>{userEmail}</strong>
            </p>
            <p className='success-description'>
              Please check your email and use the code to reset your password.
            </p>
            
            <Link href={`/reset-password?email=${encodeURIComponent(userEmail)}&username=${encodeURIComponent(username)}`} className='verify-button'>
              Verify Code
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage