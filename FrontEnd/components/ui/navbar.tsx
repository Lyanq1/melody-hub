'use client'

import Link from 'next/link'
import './components.css'
import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SearchBar from '../SearchBar'
import axios from 'axios'
import { cartService } from '@/lib/services/cart'
import { useAuth } from '@/hooks/use-auth'
import { UserRound } from 'lucide-react'

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

  // Note: We no longer fetch user data directly from navbar
  // All user data is managed through useAuth hook

  // Handle avatar updates - use user data from useAuth instead of fetching
  useEffect(() => {
    const handleAvatarUpdate = () => {
      // Use avatar from useAuth user object directly instead of fetching
      if (user?.avatarURL) {
        console.log('🔄 Updating avatar from user object:', user.avatarURL)
        setAvatarUrl(user.avatarURL)
      }
    }

    window.addEventListener('avatar-update', handleAvatarUpdate)
    return () => window.removeEventListener('avatar-update', handleAvatarUpdate)
  }, [user?.avatarURL])

  // Handle login state and user data updates
  useEffect(() => {
    // Ưu tiên sử dụng thông tin từ useAuth hook (bao gồm Google Auth)
    if (isAuthenticated && user) {
      console.log('🧭 Navbar: Using user from hook:', user)
      console.log('🖼️ Navbar: Avatar URL from user:', user.avatarURL)
      const newUsername = user.username || user.email?.split('@')[0] || ''
      const newAvatarUrl = user.avatarURL || ''

      // Chỉ update state nếu có thay đổi để tránh re-render không cần thiết
      if (username !== newUsername) setUsername(newUsername)
      if (avatarUrl !== newAvatarUrl) setAvatarUrl(newAvatarUrl)
    } else if (!isAuthenticated) {
      // User đã logout, clear state
      console.log('🧹 Navbar: Clearing user state (not authenticated)')
      setUsername('')
      setAvatarUrl('')
    }
  }, [isAuthenticated, user, avatarUrl, username])

  // Handle storage changes for traditional auth
  useEffect(() => {
    const handleStorageChange = () => {
      // Chỉ xử lý storage changes khi không có user từ hook
      if (!user) {
        const storedUsername = localStorage.getItem('username')
        setUsername(storedUsername || '')
        // Clear avatar when no user data available
        setAvatarUrl('')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user, isAuthenticated])

  return (
    <nav className='bg-black text-[20px] sticky top-0 z-50 text-white shadow-md font-[Inter_Tight]'>
      <div className='container mx-auto flex items-center justify-between p-4'>
        {/* Logo */}
        <Link className='text-white text-3xl lg:text-4xl font-black font-[Inter_Tight] mb-1 flex-shrink-0' href='/'>
          er.
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className='hidden lg:flex gap-6 xl:gap-10 text-center font-bold'>
          <Link href='/' className='hover:text-gray-300 transition-colors'>
            Home
          </Link>
          <Link href='/product' className='hover:text-gray-300 transition-colors'>
            Products
          </Link>
          <Link href='/worldmap' className='hover:text-gray-300 transition-colors whitespace-nowrap'>
            World Vinyl
          </Link>
          <Link href='/preorder' className='hover:text-gray-300 transition-colors whitespace-nowrap'>
            Pre Order
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className='flex items-center gap-3 lg:gap-6 xl:gap-8'>
          {/* Search Bar - Responsive sizing */}
          <div className='hidden sm:block'>
            <SearchBar />
          </div>

          {/* Cart Icon */}
          <Link href='/cart' className='relative flex items-center gap-2 flex-shrink-0'>
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
              <span className='absolute -top-0 -right-2 bg-[#BB3C36] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 focus:outline-none flex-shrink-0'>
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
                fontFamily: 'InterTight'
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
                  href='/tracking'
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
                      <UserRound className='w-4 h-4 stroke-white transition-colors duration-200 group-hover:stroke-black' />
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

          {/* Mobile Menu Button - Only visible on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='lg:hidden flex items-center gap-2 focus:outline-none p-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='text-white'
                >
                  <line x1='4' x2='20' y1='12' y2='12' />
                  <line x1='4' x2='20' y1='6' y2='6' />
                  <line x1='4' x2='20' y1='18' y2='18' />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56 lg:hidden'
              align='end'
              style={{
                backgroundColor: '#323031',
                color: 'white',
                border: '1px solid #444',
                fontFamily: 'InterTight'
              }}
            >
              <DropdownMenuItem asChild>
                <Link
                  href='/'
                  className='group flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-md transition-colors duration-200'
                >
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/product'
                  className='group flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-md transition-colors duration-200'
                >
                  Products
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/worldmap'
                  className='group flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-md transition-colors duration-200'
                >
                  World Vinyl
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/preorder'
                  className='group flex items-center gap-2 px-4 py-3 hover:bg-gray-700 rounded-md transition-colors duration-200'
                >
                  Pre Order
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ backgroundColor: '#444' }} />
              <DropdownMenuItem asChild>
                <div className='px-4 py-3'>
                  <SearchBar />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
