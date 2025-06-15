'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Customer')
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
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      alert(`Login successful! Welcome, ${user.displayName}`)
      window.location.href = '/'
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

            console.log('// testing')
            axios
              .get(
                `https://graph.facebook.com/me?fields=id,email,name,gender,birthday,age_range,location,hometown &access_token=${accessToken}`
              )
              .then((response) => {
                if (response.data) {
                  localStorage.setItem('facebookUser', JSON.stringify(response.data))
                }
                console.log(response.data)
              })
              .catch((err) => {
                console.error('Error fetching Facebook user data:', err)
              })

            axios
              .post('http://localhost:5000/api/auth/facebook', { accessToken, role })
              .then((res) => {
                const { token, user } = res.data
                localStorage.setItem('token', token)
                alert(`Facebook login successful! Welcome, ${user.displayName}`)
                window.location.href = '/'
              })
              .catch((err) => {
                console.error('Facebook login error:', err.response?.data || err.message)
                setError(err.response?.data?.message || 'Facebook login failed')
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

  return (
    <div className='login-container' style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Login to MelodyHub</h2>
      <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
        <div>
          <label>Username:</label>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
        </div>

        <button
          type='submit'
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <button
        onClick={handleFacebookLogin}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#3b5998',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {isLoading ? 'Logging in with Facebook...' : 'Login with Facebook'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default LoginPage
