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
      <div className='card mt-12'>
        <span style={{ fontFamily: 'Poster' }} className="card__title">Create new account</span>
        {error && <p className='text-red-500 text-sm mb-4 text-center'>{error}</p>}
        {success && <p className='text-green-500 text-sm mb-4 text-center'>{success}</p>}
        <form style={{ fontFamily: 'Poster' }} className='card__form' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='username' className='card__content'>
              Tên đăng nhập
            </label>
            <input
              style={{ fontFamily: 'GlamourCoquette' }}
              type='text'
              id='username'
              name='username'
              value={formData.username}
              onChange={handleChange}
              placeholder='john123'
              required
            />
          </div>

          <div>
            <label htmlFor='password' className='card__content'>
              Mật khẩu
            </label>
            <input
              style={{ fontFamily: 'GlamourCoquette' }}
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='••••••••'
              required
            />
          </div>

          <div>
            <label htmlFor='email' className='card__content'>
              Email
            </label>
            <input
              style={{ fontFamily: 'GlamourCoquette' }}
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='john123@gmail.com'
              required
            />
          </div>

          <div>
            <label htmlFor='displayName' className='card__content'>
              Tên hiển thị
            </label>
            <input
              style={{ fontFamily: 'GlamourCoquette' }}
              type='text'
              id='displayName'
              name='displayName'
              value={formData.displayName}
              onChange={handleChange}
              placeholder='John Doe'
              required
            />
          </div>

          <div>
            <label htmlFor='phoneNumber' className='card__content'>
              Số điện thoại
            </label>
            <input
              style={{ fontFamily: 'GlamourCoquette' }}
              type='tel'
              id='phoneNumber'
              name='phoneNumber'
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder='0909123123'
              required
            />
          </div>

          <div>
            <label htmlFor='address' className='card__content'>
              Địa chỉ
            </label>
            <input
              style={{ fontFamily: 'GlamourCoquette' }}
              type='text'
              id='address'
              name='address'
              value={formData.address}
              onChange={handleChange}
              placeholder='227 Đ. Nguyễn Văn Cừ, Phường 4, Quận 5, Hồ Chí Minh'
              required
            />
          </div>

          <div>
            <label htmlFor='role' className='card__content'>
              Vai trò
            </label>
            <select
              style={{ fontFamily: 'GlamourCoquette' }}
              id='role'
              name='role'
              value={formData.role}
              onChange={handleChange}
              className='card__select'
              required
            >
              <option style={{ fontFamily: 'GlamourCoquette' }} value='' disabled>
                Chọn vai trò
              </option>
              <option style={{ fontFamily: 'GlamourCoquette' }} value='Customer'>Khách hàng</option>
              <option style={{ fontFamily: 'GlamourCoquette' }} value='Artist'>Nghệ sĩ</option>
              <option style={{ fontFamily: 'GlamourCoquette' }} value='Admin'>Quản trị viên</option>
            </select>
          </div>

          <button
            type='submit'
            className='card__button'
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create'}
          </button>

          <p className='card__content'>
            Đã có tài khoản?{' '}
            <a href='/login' className='card__content text-blue-500 hover:underline'>
              Đăng nhập tại đây
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
