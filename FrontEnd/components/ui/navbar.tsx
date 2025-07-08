// // // components/Navbar.tsx
// // import Link from 'next/link'
// // import './components.css' // Giả sử chứa CSS tùy chỉnh cho ô tìm kiếm của bạn

// // // Import các component DropdownMenu từ Shadcn UI
// // import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu' // Điều chỉnh đường dẫn nếu cần thiết
// // import Image from 'next/image'

// // export const Navbar = () => {
// //   return (
// //     <nav style={{ backgroundColor: '#323031', fontSize: '20px' }} className='sticky top-0 z-50 text-white shadow-md'>
// //       <div style={{ fontFamily: 'MicaValo' }} className='container mx-auto flex items-center justify-between p-4'>
// //         <Link href='/'>ECHO RECORDS</Link>
// //         <div className='flex gap-10 text-center'>
// //           <Link href='/'>home</Link>
// //           <Link href='/products'>products</Link>
// //         </div>
// //         {/* Search */}
// //         <div className='ui-input-container'>
// //           <input placeholder='Search...' className='ui-input' type='text' />
// //           <div className='ui-input-underline'></div>
// //           <div className='ui-input-highlight'></div>
// //           <div className='ui-input-icon'>
// //             <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
// //               <path
// //                 strokeLinejoin='round'
// //                 strokeLinecap='round'
// //                 strokeWidth='2'
// //                 stroke='currentColor'
// //                 d='M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z'
// //               ></path>
// //             </svg>
// //           </div>
// //         </div>
// //         <div className='flex gap-10 text-center'>
// //           <Link href='/cart' className='flex items-center gap-2'>
// //             <Image src='/assets/cart.png' alt='Cart' width={24} height={24} className='cursor-pointer' />
// //           </Link>

// //           {/* Dropdown Menu cho biểu tượng tài khoản */}
// //           <DropdownMenu>
// //             {/* DropdownMenuTrigger là phần tử sẽ kích hoạt menu (ở đây là icon user) */}
// //             <DropdownMenuTrigger asChild>
// //               {/* Sử dụng button để đảm bảo khả năng truy cập (accessibility) */}
// //               <button className='flex items-center gap-2 focus:outline-none'>
// //                 {/* <img src='/assets/user.png' alt='Account' className='w-6 h-6 cursor-pointer' /> */}
// //                 <Image src='/assets/user.png' alt='Account' width={24} height={24} className='cursor-pointer' />
// //               </button>
// //             </DropdownMenuTrigger>

// //             {/* DropdownMenuContent là nội dung của menu thả xuống */}
// //             <DropdownMenuContent
// //               className='w-56'
// //               align='end'
// //               style={{ backgroundColor: '#323031', color: 'white', border: '1px solid #444', fontFamily: 'MicaValo' }}
// //             >
// //               {/* Mục WISHLIST */}
// //               <DropdownMenuItem asChild>
// //                 <Link
// //                   href='/wishlist'
// //                   className='flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
// //                 >
// //                   {/* Thay icon bằng icon trái tim thực tế nếu có (ví dụ từ Lucide React) */}
// //                   <span className='text-xl'>💖</span> wishlist
// //                 </Link>
// //               </DropdownMenuItem>

// //               {/* Mục THEO DÕI ĐƠN HÀNG */}
// //               <DropdownMenuItem asChild>
// //                 <Link
// //                   href='/order-tracking'
// //                   className='flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
// //                 >
// //                   {/* Thay icon bằng icon giỏ hàng/thùng rác thực tế nếu có */}
// //                   <span className='text-xl'>🧺</span> Theo dõi đơn hàng
// //                 </Link>
// //               </DropdownMenuItem>

// //               {/* Mục ĐĂNG KÝ */}
// //               <DropdownMenuItem asChild>
// //                 <Link
// //                   href='/register'
// //                   className='flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
// //                 >
// //                   {/* Thay icon bằng icon người dùng/key thực tế nếu có */}
// //                   <span className='text-xl'>🔑</span> đăng ký
// //                 </Link>
// //               </DropdownMenuItem>

// //               {/* Mục ĐĂNG NHẬP */}
// //               <DropdownMenuItem asChild>
// //                 <Link
// //                   href='/login'
// //                   className='flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
// //                 >
// //                   {/* Thay icon bằng icon người dùng/key thực tế nếu có */}
// //                   <span className='text-xl'>✌️</span> đăng nhập
// //                 </Link>
// //               </DropdownMenuItem>
// //             </DropdownMenuContent>
// //           </DropdownMenu>
// //           {/* Kết thúc Dropdown Menu */}
// //         </div>
// //       </div>
// //     </nav>
// //   )
// // }

'use client'

import Link from 'next/link'
import './components.css'
import { useState, useEffect } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Image from 'next/image'

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const getCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const total = cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
      setCartCount(total)
    }

    getCartCount()

    // Lắng nghe sự kiện custom khi có thay đổi từ ProductCard
    window.addEventListener('cart-updated', getCartCount)

    return () => window.removeEventListener('cart-updated', getCartCount)
  }, [])

  useEffect(() => {
    // Kiểm tra và log trạng thái từ localStorage
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    console.log('Initial isLoggedIn from localStorage:', loggedIn)
    setIsLoggedIn(loggedIn)

    // Lắng nghe sự kiện thay đổi từ localStorage
    const handleStorageChange = () => {
      const updatedLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      console.log('Storage changed, updated isLoggedIn:', updatedLoggedIn)
      if (updatedLoggedIn !== isLoggedIn) {
        setIsLoggedIn(updatedLoggedIn)
      }
    }
    window.addEventListener('storage', handleStorageChange)

    // Dọn dẹp event listener
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [isLoggedIn])

  return (
    <nav style={{ backgroundColor: '#323031', fontSize: '20px' }} className='sticky top-0 z-50 text-white shadow-md'>
      <div style={{ fontFamily: 'MicaValo' }} className='container mx-auto flex items-center justify-between p-4'>
        <Link href='/'>ECHO RECORDS</Link>
        <div className='flex gap-10 text-center'>
          <Link href='/'>home</Link>
          <Link href='/products'>products</Link>
        </div>
        <div className='ui-input-container'>
          <input placeholder='search...' className='ui-input' type='text' />
          <div className='ui-input-underline'></div>
          <div className='ui-input-highlight'></div>
          <div className='ui-input-icon'>
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
              <path
                strokeLinejoin='round'
                strokeLinecap='round'
                strokeWidth='2'
                stroke='currentColor'
                d='M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z'
              ></path>
            </svg>
          </div>
        </div>
        <div className='flex gap-10 text-center'>
          <Link href='/cart' className='relative flex items-center gap-2'>
            <Image src='/assets/cart.png' alt='Cart' width={24} height={24} className='cursor-pointer' />
            {cartCount >= 1 && (
              <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {cartCount}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 focus:outline-none'>
                <Image src='/assets/user.png' alt='Account' width={24} height={24} className='cursor-pointer' />
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
                  className='flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                >
                  <span className='text-xl'>💖</span> wishlist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/order-tracking'
                  className='flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                >
                  <span className='text-xl'>🧺</span> Theo dõi đơn hàng
                </Link>
              </DropdownMenuItem>
              {!isLoggedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href='/register'
                      className='flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                    >
                      <span className='text-xl'>🔑</span> đăng ký
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href='/login'
                      className='flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                    >
                      <span className='text-xl'>✌️</span> đăng nhập
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link
                    href='/profile'
                    className='flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'
                  >
                    <span className='text-xl'>👤</span> Tài khoản
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
