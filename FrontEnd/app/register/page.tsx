'use client'

import React from 'react'

export default function RegisterPage() {
  return (
    <div
      className='min-h-screen bg-cover bg-center flex items-center justify-center'
      style={{
        backgroundImage: `url('/vercel.svg')` // your image here
      }}
    >
      <div className='bg-gray-900 bg-opacity-90 text-white rounded-lg p-8 w-full max-w-md shadow-lg'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Create your Free Account</h2>
        <form className='space-y-4'>
          <div>
            <label className='text-sm mb-1 block'>Username</label>
            <input
              type='text'
              placeholder='john123'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none'
              required
            />
          </div>
          <div>
            <label className='text-sm mb-1 block'>Display Name</label>
            <input
              type='text'
              placeholder='john123'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none'
              required
            />
          </div>

          <div>
            <label className='text-sm mb-1 block'>Phone Number</label>
            <input
              type='tel'
              placeholder='0909123123'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none'
              required
            />
          </div>

          <div>
            <label className='text-sm mb-1 block'>Address</label>
            <input
              type='text'
              placeholder='227 Đ. Nguyễn Văn Cừ, Phường 4, Quận 5, Hồ Chí Minh'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none'
              required
            />
          </div>

          <div>
            <label className='text-sm mb-1 block'>Password</label>
            <input
              type='password'
              placeholder='••••••••'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none'
              required
            />
          </div>

          <div>
            <label className='text-sm mb-1 block'>Confirm password</label>
            <input
              type='password'
              placeholder='••••••••'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none'
              required
            />
          </div>

          <div>
            <label className='text-sm mb-1 block'>Role</label>
            <select
              name='role'
              className='w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none'
              required
              defaultValue=''
            >
              <option value='' disabled>
                Select a role
              </option>
              <option value='customer'>Customer</option>
              <option value='artist'>Artist</option>
              <option value='admin'>Admin</option>
            </select>
          </div>

          {/* Birthdate */}
          {/* <div>
            <label className='text-sm mb-1 block'>Birth Date</label>
            <div className='flex gap-2'>
              <select className='w-full bg-gray-800 border border-gray-700 p-2 rounded'>
                <option>Day</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i}>{i + 1}</option>
                ))}
              </select>
              <select className='w-full bg-gray-800 border border-gray-700 p-2 rounded'>
                <option>Month</option>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <option key={i}>{m}</option>
                ))}
              </select>
              <select className='w-full bg-gray-800 border border-gray-700 p-2 rounded'>
                <option>Year</option>
                {[...Array(100)].map((_, i) => (
                  <option key={i}>{2025 - i}</option>
                ))}
              </select>
            </div>
          </div> */}

          {/* Terms and coditions */}

          {/* <div className='flex items-center gap-2'>
            <input type='checkbox' id='terms' className='w-4 h-4' required />
            <label htmlFor='terms' className='text-sm'>
              I accept the{' '}
              <a href='#' className='underline text-blue-400'>
                Terms and Conditions
              </a>
            </label>
          </div> */}

          <button type='submit' className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded'>
            Create an account
          </button>

          <p className='text-sm text-center mt-2'>
            Already have an account?{' '}
            <a href='/login' className='text-blue-400 underline'>
              Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
