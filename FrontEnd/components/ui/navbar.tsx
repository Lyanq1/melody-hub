'use client'

import Link from 'next/link'
import './components.css'
import { useState, useEffect } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SearchBar from '../SearchBar'
import axios from 'axios'
import { cartService } from '@/lib/services/cart'
import { useAuth } from '@/hooks/use-auth'
import { User2Icon } from 'lucide-react'

export const Navbar = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth()
  
  console.log('🧭 Navbar state:', { user, isAdmin, isAuthenticated })
  const [cartCount, setCartCount] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [username, setUsername] = useState('')

  const handleLogout = () => {
    logout()
    // Redirect to home after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  // Cart count effect (sync with DB by user)
  useEffect(() => {
    let isMounted = true

    const fetchCartCount = async () => {
      try {
        if (!isAuthenticated || !user?.accountID) {
          if (isMounted) setCartCount(0)
          return
        }
        const cart = await cartService.getCartByUserId(user.accountID)
        if (isMounted) setCartCount(cart?.items?.length || 0)
      } catch (error) {
        console.error('Error fetching cart count:', error)
        if (isMounted) setCartCount(0)
      }
    }

    fetchCartCount()

    const onCartUpdated = () => fetchCartCount()
    window.addEventListener('cart-updated', onCartUpdated)
    return () => {
      isMounted = false
      window.removeEventListener('cart-updated', onCartUpdated)
    }
  }, [isAuthenticated, user?.accountID])

  // Fetch user data function
  const fetchUserData = async (username: string) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/user/${username}`)
      setAvatarUrl(res.data.AvatarURL || '')
    } catch (err) {
      console.error('Error fetching user data:', err)
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
      const storedUsername = localStorage.getItem('username')
      setUsername(storedUsername || '')

      if (isAuthenticated && storedUsername) {
        fetchUserData(storedUsername)
      } else {
        setAvatarUrl('')
      }
    }

    // Initial state
    updateLoginState()

    // Handle storage changes
    const handleStorageChange = () => {
      updateLoginState()
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isAuthenticated])

  return (
    <nav style={{ backgroundColor: '#323031', fontSize: '20px' }} className='sticky top-0 z-50 text-white shadow-md'>
      <div style={{ fontFamily: 'MicaValo' }} className='container mx-auto flex items-center justify-between p-4'>
        <Link href='/'>ECHO RECORDS</Link>
        <div className='flex gap-10 text-center'>
          <Link href='/'>Home</Link>
          <Link href='/product'>Products</Link>
          <Link href='/worldmap'>World Vinyl</Link>
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
                <Avatar className='h-[35px] w-[35px] cursor-pointer'>
                  <AvatarImage src={avatarUrl || 'https://github.com/shadcn.png'} />
                  <AvatarFallback className='text-sm'>
                    {username ? username.charAt(0).toUpperCase() : 'U'}
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
              {!isAuthenticated ? (
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
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href='/profile'
                      className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                    >
                      <User2Icon className='w-4 h-4' />
                      Tài khoản
                    </Link>
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href='/dashboard'
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
                            className='lucide lucide-layout-dashboard transition-colors duration-200 group-hover:stroke-black'
                          >
                            <path d='M3 3h6v6H3z' />
                            <path d='M14 3h7v6h-7z' />
                            <path d='M14 14h7v7h-7z' />
                            <path d='M3 14h6v7H3z' />
                          </svg>
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href='/admin'
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
                            className='lucide lucide-settings transition-colors duration-200 group-hover:stroke-black'
                          >
                            <circle cx='12' cy='12' r='3' />
                            <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' />
                          </svg>
                          Quản lý hệ thống
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200 cursor-pointer'
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
                      className='lucide lucide-log-out transition-colors duration-200 group-hover:stroke-black'
                    >
                      <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                      <polyline points='16,17 21,12 16,7' />
                      <line x1='21' x2='9' y1='12' y2='12' />
                    </svg>
                    Đăng xuất
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
