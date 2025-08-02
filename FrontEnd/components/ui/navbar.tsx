'use client'

import Link from 'next/link'
import './components.css'
import { useState, useEffect } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SearchBar from '../SearchBar'
import axios from 'axios'

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [username, setUsername] = useState("")

  // Cart count effect
  useEffect(() => {
    const getCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const uniqueCount = cart.length
      setCartCount(uniqueCount)
    }

    getCartCount()
    window.addEventListener('cart-updated', getCartCount)
    return () => window.removeEventListener('cart-updated', getCartCount)
  }, [])

  // Fetch user data function
  const fetchUserData = async (username: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/user/${username}`)
      setAvatarUrl(res.data.AvatarURL || "")
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }

  // Handle avatar updates
  useEffect(() => {
    const handleAvatarUpdate = () => {
      const storedUsername = localStorage.getItem('username')
      if (storedUsername) {
        fetchUserData(storedUsername)
      }
    }

    window.addEventListener('avatar-update', handleAvatarUpdate)
    return () => window.removeEventListener('avatar-update', handleAvatarUpdate)
  }, [])

  // Handle login state and initial data fetch
  useEffect(() => {
    const updateLoginState = () => {
      const tokenvalue = localStorage.getItem('token')
      const storedUsername = localStorage.getItem('username')
      const loggedIn = !!tokenvalue
      
      setIsLoggedIn(loggedIn)
      setUsername(storedUsername || "")

      if (loggedIn && storedUsername) {
        fetchUserData(storedUsername)
      } else {
        setAvatarUrl("")
      }
    }

    // Initial state
    updateLoginState()

    // Handle logout event
    const handleLogout = () => {
      // Immediately update state
      setIsLoggedIn(false)
      setUsername("")
      setAvatarUrl("")
      
      // Force a re-render by updating login state
      updateLoginState()
    }

    // Handle storage changes
    const handleStorageChange = () => {
      updateLoginState()
    }

    window.addEventListener('user-logout', handleLogout)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('user-logout', handleLogout)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <nav style={{ backgroundColor: '#323031', fontSize: '20px' }} className='sticky top-0 z-50 text-white shadow-md'>
      <div style={{ fontFamily: 'MicaValo' }} className='container mx-auto flex items-center justify-between p-4'>
        <Link href='/'>ECHO RECORDS</Link>
        <div className='flex gap-10 text-center'>
          <Link href='/'>Home</Link>
          <Link href='/product'>Products</Link>
        </div>
        <SearchBar />

        <div className='flex gap-8 text-center'>
          <Link href='/cart' className='relative flex items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='28'
              height='28'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#ffffff'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-shopping-cart-icon lucide-shopping-cart cursor-pointer'
            >
              <circle cx='8' cy='21' r='1' />
              <circle cx='19' cy='21' r='1' />
              <path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' />
            </svg>
            {cartCount >= 1 && (
              <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {cartCount}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 focus:outline-none'>
                <Avatar className="h-[35px] w-[35px] cursor-pointer">
                  <AvatarImage src={avatarUrl || "https://github.com/shadcn.png"} />
                  <AvatarFallback className="text-sm">
                    {username ? username.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56'
              align='end'
              style={{
                backgroundColor: '#323031',
                color: 'white',
                border: '1px solid #444',
                fontFamily: 'MicaValo'
              }}
            >
              <DropdownMenuItem asChild>
                <Link
                  href='/wishlist'
                  className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#ffffff'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-heart-icon lucide-heart transition-colors duration-200 group-hover:stroke-black'
                  >
                    <path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' />
                  </svg>
                  Wishlist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/order-tracking'
                  className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#ffffff'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-shopping-basket-icon lucide-shopping-basket transition-colors duration-200 group-hover:stroke-black'
                  >
                    <path d='m15 11-1 9' />
                    <path d='m19 11-4-7' />
                    <path d='M2 11h20' />
                    <path d='m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4' />
                    <path d='M4.5 15.5h15' />
                    <path d='m5 11 4-7' />
                    <path d='m9 11 1 9' />
                  </svg>
                  Theo dõi đơn hàng
                </Link>
              </DropdownMenuItem>
              {!isLoggedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href='/register'
                      className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#ffffff'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-circle-user-round-icon lucide-circle-user-round transition-colors duration-200 group-hover:stroke-black'
                      >
                        <path d='M18 20a6 6 0 0 0-12 0' />
                        <circle cx='12' cy='10' r='4' />
                        <circle cx='12' cy='12' r='10' />
                      </svg>
                      Register
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href='/login'
                      className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#ffffff'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-key-icon lucide-key transition-colors duration-200 group-hover:stroke-black'
                      >
                        <path d='m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4' />
                        <path d='m21 2-9.6 9.6' />
                        <circle cx='7.5' cy='15.5' r='5.5' />
                      </svg>
                      Login
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link
                    href='/profile'
                    className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#ffffff'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='lucide lucide-user-icon lucide-user transition-colors duration-200 group-hover:stroke-black'
                    >
                      <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                      <circle cx='12' cy='7' r='4' />
                    </svg>
                    Tài khoản
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
