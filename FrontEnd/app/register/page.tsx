/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState } from 'react'
import axios from 'axios'
import './register.css'
import { AUTH_ENDPOINTS } from '@/lib/config'
export default function RegisterPage() {
  // Định nghĩa interface cho formData
  interface FormData {
    username: string
    password: string
    email: string
    displayName: string
    phone: string
    address: string
  }

  // State cho form inputs
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
    displayName: '',
    phone: '',
    address: ''
  })
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Xử lý thay đổi input với kiểu ChangeEvent
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Xử lý submit form với kiểu FormEvent
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Kiểm tra client-side cơ bản
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      setLoading(false)
      return
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Định dạng email không hợp lệ')
      setLoading(false)
      return
    }
    // http://localhost:5000/api/auth/register
    try {
      const response = await axios.post(AUTH_ENDPOINTS.REGISTER, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.')
      localStorage.setItem("userEmail", formData.email);
      setFormData({
        username: '',
        password: '',
        email: '',
        displayName: '',
        phone: '',
        address: ''
      })
      // Chuyển hướng tới trang login sau 2 giây
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className='min-h-screen w-full bg-cover bg-center flex items-center justify-center'
      style={{
        backgroundImage: `url('')` // Thay bằng hình nền phù hợp
      }}
    >
      <div className='wrapper'>
        <h1 style={{ fontFamily: 'Tangkiwood' }}>REGISTER</h1>
        {error && <p className='text-red-500 text-sm mb-4 text-center'>{error}</p>}
        {success && <p className='text-green-500 text-sm mb-4 text-center'>{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className='input-box font-["Inter_Tight"]'>
            <input
              type='text'
              id='username'
              name='username'
              value={formData.username}
              onChange={handleChange}
              placeholder='username'
              required
            />
          </div>

          <div className='input-box'>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='email'
              required
            />
            <i className='bx bxs-user'></i>
          </div>

          <div className='input-box'>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='password'
              required
            />
            <i className='bx bxs-lock-alt'></i>
          </div>

          <div className='input-box'>
            <input
              type='text'
              id='displayName'
              name='displayName'
              value={formData.displayName}
              onChange={handleChange}
              placeholder='name'
              required
            />
          </div>

          <div className='input-box'>
            <input
              type='text'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              placeholder='phone'
            />
          </div>

          <div className='input-box'>
            <input
              type='text'
              id='address'
              name='address'
              value={formData.address}
              onChange={handleChange}
              placeholder='address'
            />
          </div>

          <div className='input-box font-["Inter_Tight"]'>
          
            <i className='bx bxs-chevron-down'></i>
          </div>

          <div className='btn font-[Tangkiwood]'>
            <button className='btn' type='submit' disabled={loading}>
              <span className='btn font-[Tangkiwood]'>{loading ? 'Creating account...' : 'REGISTER'}</span>
            </button>
          </div>

          <div className='register-link font-["Inter_Tight"]'>
            <p>
              Already have an account? <a href='/login'> Login here </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
