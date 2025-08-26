/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './login.css'
import { toast } from 'sonner'
import { AUTH_ENDPOINTS } from '@/lib/config'
declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}
import { signIn } from 'next-auth/react'
import { useAuth } from '@/hooks/use-auth'

const LoginPage = () => {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role] = useState('Customer')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.FB) {
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.crossOrigin = 'anonymous'
      script.onload = () => {
        if (window.FB) {
          window.fbAsyncInit = function () {
            window.FB.init({
              appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
              cookie: true,
              xfbml: true,
              version: 'v23.0'
            })
          }
          window.FB.XFBML.parse()
          console.log('Facebook SDK loaded successfully')
        }
      }
      document.body.appendChild(script)
    } else if (window.FB) {
      window.FB.XFBML.parse()
      console.log('Facebook SDK already loaded')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, { username, password })
      const { token, user } = response.data

      console.log('✅ Traditional login successful:', user)

      // Sử dụng useAuth login function
      login(token, user)

      toast.success(`Login successful! Welcome, ${user.displayName}`)

      // Redirect dựa trên role
      if (user.role === 'Admin' || user.role === 'Artist') {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed')
      } else if (err instanceof Error) {
        setError(err.message || 'Login failed')
      } else {
        setError('Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookLogin = () => {
    setIsLoading(true)
    setError('')

    if (typeof window !== 'undefined' && window.FB && window.location.protocol === 'https:') {
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken
            console.log('Access token received:', accessToken)

            // Lấy thông tin user từ Facebook Graph API với picture
            console.log('🔍 Fetching Facebook user data...')
            axios
              .get(
                `https://graph.facebook.com/me?fields=id,email,name,picture.type(large),gender,birthday,age_range,location,hometown&access_token=${accessToken}`
              )
              .then((response) => {
                const fbUserData = response.data
                console.log('👤 Facebook user data:', fbUserData)

                if (fbUserData) {
                  localStorage.setItem('facebookUser', JSON.stringify(fbUserData))
                }

                // Gọi backend login với thông tin đầy đủ
                return axios.post(AUTH_ENDPOINTS.FACEBOOK_LOGIN, { accessToken, role })
              })
              .then((res) => {
                const { token, user } = res.data
                console.log('✅ Facebook login successful:', user)

                // Sử dụng useAuth login function
                login(token, user)

                toast.success(`Facebook login successful! Welcome, ${user.displayName}`)

                // Redirect dựa trên role
                if (user.role === 'Admin' || user.role === 'Artist') {
                  window.location.href = '/dashboard'
                } else {
                  window.location.href = '/'
                }
              })
              .catch((err) => {
                console.error('Facebook login error:', err.response?.data || err.message)
                const errorMessage = err.response?.data?.message || err.message || 'Facebook login failed'
                setError(errorMessage)
                toast.error(errorMessage)
              })
              .finally(() => setIsLoading(false))
          } else {
            setError('User cancelled login or did not authorize')
            setIsLoading(false)
          }
        },
        { scope: 'email,public_profile' }
      )
    } else {
      setError('Facebook login requires HTTPS or SDK not loaded')
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setIsLoading(true)
      setError('')

      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: false
      })

      if (result?.error) {
        setError('Google login failed')
        toast.error('Google login failed')
      } else if (result?.ok) {
        toast.success('Google login successful!')

        // 🔑 Wait a bit for NextAuth callback to complete and store token
        setTimeout(() => {
          const token = localStorage.getItem('token')
          if (token) {
            console.log('✅ Google login: JWT token found in localStorage')
          } else {
            console.log('⚠️ Google login: No JWT token found, may need to refresh')
          }
          window.location.href = '/'
        }, 1000)
      }
    } catch (e) {
      setError('Google sign-in failed')
      toast.error('Google sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className='min-h-[calc(100vh-64px)] bg-cover bg-center flex items-center justify-center'
      style={{
        backgroundImage: `url('')` // Thay bằng hình nền phù hợp
      }}
    >
      <div className='wrapper'>
        <h1 style={{ fontFamily: 'Tangkiwood' }}>ACCOUNT LOGIN</h1>
        {error && <p className='text-red-500 text-sm mb-4 text-center'>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className='input-box font-["Inter_Tight"]'>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='username'
              required
            />
          </div>
          <div className='input-box font-["Inter_Tight"]'>
            <input
              placeholder='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className='forgot-password-link font-["Inter_Tight"]'>
            <a href='/forgot-password'>
              Forgot Password?
            </a>
          </div>
          <button type='submit' disabled={isLoading} className='btn font-[Tangkiwood] mt-5'>
            <span>{isLoading ? 'Logging in...' : 'LOGIN'}</span>
          </button>
        </form>
        <p className='text-sm text-center mt-4 font-[Inter_Tight]'>or</p>
        {/* <p className='text-2xl text-center mt-4'>Login with Facebook</p> */}
        <button onClick={handleFacebookLogin} disabled={isLoading} className='btn font-[Tangkiwood] text-white mt-5'>
          <span>{isLoading ? 'Logging in...' : 'FACEBOOK LOGIN'}</span>
        </button>

        <button
          onClick={handleGoogle}
          className='btn font-[Tangkiwood] text-white mt-3 flex items-center justify-center gap-2'
        >
          <img
            src='https://toppng.com/uploads/preview/google-g-logo-icon-11609362962anodywxeaz.png'
            alt='Google'
            width={18}
            height={18}
            style={{ background: 'white', borderRadius: 2 }}
          />
          <span>CONTINUE WITH GOOGLE</span>
        </button>

        <div className='register-link font-["Inter_Tight"] mt-4'>
          <p>
            Don't have an account? <a href='/register'> Register here </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
