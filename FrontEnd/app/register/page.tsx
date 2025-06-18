/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import React, { useState } from 'react'
import axios from 'axios'

export default function RegisterPage() {
  // Định nghĩa interface cho formData
  interface FormData {
    username: string
    password: string
    email: string
    displayName: string
    phoneNumber: string
    address: string
    role: string
  }

  // State cho form inputs
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
    displayName: '',
    phoneNumber: '',
    address: '',
    role: ''
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
    if (!formData.role) {
      setError('Vui lòng chọn vai trò')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('https://melody-hub-vhml.onrender.com/api/auth/register', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.')
      setFormData({
        username: '',
        password: '',
        email: '',
        displayName: '',
        phoneNumber: '',
        address: '',
        role: ''
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
      className='min-h-screen bg-cover bg-center flex items-center justify-center'
      style={{
        backgroundImage: `url('/background.jpg')` // Thay bằng hình nền phù hợp
      }}
    >
      <div className='bg-gray-900 bg-opacity-90 text-white rounded-lg p-8 w-full max-w-md shadow-lg'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Tạo Tài Khoản Miễn Phí</h2>
        {error && <p className='text-red-500 text-sm mb-4 text-center'>{error}</p>}
        {success && <p className='text-green-500 text-sm mb-4 text-center'>{success}</p>}
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='username' className='text-sm mb-1 block'>
              Tên đăng nhập
            </label>
            <input
              type='text'
              id='username'
              name='username'
              value={formData.username}
              onChange={handleChange}
              placeholder='john123'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />
          </div>

          <div>
            <label htmlFor='password' className='text-sm mb-1 block'>
              Mật khẩu
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='••••••••'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />
          </div>

          <div>
            <label htmlFor='email' className='text-sm mb-1 block'>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='john123@gmail.com'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />
          </div>

          <div>
            <label htmlFor='displayName' className='text-sm mb-1 block'>
              Tên hiển thị
            </label>
            <input
              type='text'
              id='displayName'
              name='displayName'
              value={formData.displayName}
              onChange={handleChange}
              placeholder='John Doe'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />
          </div>

          <div>
            <label htmlFor='phoneNumber' className='text-sm mb-1 block'>
              Số điện thoại
            </label>
            <input
              type='tel'
              id='phoneNumber'
              name='phoneNumber'
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder='0909123123'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />
          </div>

          <div>
            <label htmlFor='address' className='text-sm mb-1 block'>
              Địa chỉ
            </label>
            <input
              type='text'
              id='address'
              name='address'
              value={formData.address}
              onChange={handleChange}
              placeholder='227 Đ. Nguyễn Văn Cừ, Phường 4, Quận 5, Hồ Chí Minh'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />
          </div>

          <div>
            <label htmlFor='role' className='text-sm mb-1 block'>
              Vai trò
            </label>
            <select
              id='role'
              name='role'
              value={formData.role}
              onChange={handleChange}
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            >
              <option value='' disabled>
                Chọn vai trò
              </option>
              <option value='Customer'>Khách hàng</option>
              <option value='Artist'>Nghệ sĩ</option>
              <option value='Admin'>Quản trị viên</option>
            </select>
          </div>

          <button
            type='submit'
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:bg-gray-600'
            disabled={loading}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>

          <p className='text-sm text-center mt-2'>
            Đã có tài khoản?{' '}
            <a href='/login' className='text-blue-400 underline'>
              Đăng nhập tại đây
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
