'use client'

import Link from 'next/link'
import './components.css'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

export const AdminNavbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()

  const handleLogout = () => {
    logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <nav className='bg-black text-[20px] sticky top-0 z-50 text-white shadow-md font-[Inter_Tight]'>
      <div className='container mx-auto flex items-center justify-between p-4'>
        <Link className='text-white text-3xl lg:text-4xl font-black font-[Inter_Tight] mb-1 flex-shrink-0' href='/dashboard'>
          er.
        </Link>

        <div className='hidden lg:flex gap-6 xl:gap-10 text-center font-bold'>
          <Link href='/dashboard' className='hover:text-gray-300 transition-colors'>
            Dashboard
          </Link>

        </div>

        <div className='flex items-center gap-3 lg:gap-6 xl:gap-8'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 focus:outline-none flex-shrink-0'>
                <Avatar className='h-[35px] w-[35px] cursor-pointer'>
                  <AvatarImage src={'https://github.com/shadcn.png'} />
                  <AvatarFallback className='text-sm'>
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
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
                fontFamily: 'Inter_Tight'
              }}
            >
              {isAuthenticated && isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard' className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/admin' className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200'>
                      Quản lý hệ thống
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ backgroundColor: '#444' }} />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout} className='group flex items-center gap-2 px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200 cursor-pointer'>
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar


