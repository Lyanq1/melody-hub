'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useSession } from 'next-auth/react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function Profile() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [username, setUsername] = useState('')

  const [displayedName, setDisplayedName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    // if (!isAuthenticated) {
    //   router.push('/login');
    //   return;
    // }

    if (user) {
      console.log('👤 Profile page user data:', user)
      console.log('🖼️ Avatar URL from user:', user.avatarURL)

      setUsername(user.username || user.email?.split('@')[0] || '')
      setFullName(user.displayName || '')
      setDisplayedName(user.displayName || 'Chưa có tên')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setAddress(user.address || '')
      // Ưu tiên avatar từ Google Auth hoặc backend
      setAvatarUrl(user.avatarURL || '')
      setLoading(false)
    }
  }, [isAuthenticated, user, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Lấy authorization header tùy thuộc vào loại authentication
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')

    if (token) {
      // Traditional JWT authentication
      return {
        Authorization: `Bearer ${token}`
      }
    } else if (session?.user) {
      // Google Auth - sử dụng accountID hoặc email làm identifier
      const sessionUser = session.user as any
      return {
        'X-Session-User': JSON.stringify({
          accountID: sessionUser.accountID,
          email: sessionUser.email,
          username: sessionUser.username
        })
      }
    }

    return {}
  }

  const handleSave = async () => {
    try {
      // Kiểm tra nếu user có accountID (từ backend) thì dùng endpoint cập nhật
      if (user?.accountID) {
        const headers = getAuthHeaders()
        console.log('🔑 Sending request with headers:', headers)

        // Sử dụng username hoặc email làm identifier
        const userIdentifier = username || user.email?.split('@')[0] || user.email

        await axios.put(
          `http://localhost:5000/api/auth/user/${userIdentifier}`,
          {
            DisplayName: fullName,
            Email: email,
            Address: address,
            Phone: phone,
            AvatarURL: avatarUrl
          },
          { headers }
        )
      } else {
        // Nếu không có accountID, có thể là Google user chưa được sync
        toast.warning('Thông tin user chưa được đồng bộ hoàn toàn. Vui lòng thử lại sau khi đăng nhập lại.')
        return
      }

      // Cập nhật useAuth state để refresh navbar
      if (user) {
        // Cập nhật user object trong useAuth
        const updatedUser = {
          ...user,
          displayName: fullName,
          email: email,
          phone: phone,
          address: address,
          avatarURL: avatarUrl
        }

        // Trigger refresh user info in useAuth hook
        if (typeof window !== 'undefined') {
          // Dispatch custom event với updated user data
          window.dispatchEvent(
            new CustomEvent('user-profile-updated', {
              detail: updatedUser
            })
          )

          // Dispatch event for navbar avatar update
          window.dispatchEvent(new Event('avatar-update'))
        }
      }

      toast.success('Cập nhật thông tin thành công!')
      setDisplayedName(fullName)
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin:', err)
      toast.error('Đã xảy ra lỗi khi cập nhật.')
    }
  }
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }
  // Tối ưu hóa ảnh trước khi convert base64
  const compressImage = (file: File, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Giới hạn kích thước tối đa
        const maxWidth = 400
        const maxHeight = 400

        let { width, height } = img

        // Tính toán kích thước mới giữ tỷ lệ
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Vẽ ảnh với kích thước mới
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to base64 với quality thấp hơn
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // When file is selected for avatar
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('📁 Original file size:', (file.size / 1024).toFixed(2), 'KB')

      // Kiểm tra định dạng file
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ')
        return
      }

      setImageProcessing(true)
      toast.info('Đang xử lý ảnh...')

      try {
        // Tối ưu hóa ảnh
        const compressedBase64 = await compressImage(file, 0.7)

        // Kiểm tra kích thước sau khi nén
        const sizeInKB = (compressedBase64.length * 0.75) / 1024 // ước tính kích thước base64
        console.log('📦 Compressed size:', sizeInKB.toFixed(2), 'KB')

        if (sizeInKB > 100) {
          // Nén thêm nếu vẫn còn lớn
          const moreCompressed = await compressImage(file, 0.5)
          const newSize = (moreCompressed.length * 0.75) / 1024
          console.log('📦 More compressed size:', newSize.toFixed(2), 'KB')

          if (newSize > 100) {
            toast.warning('Ảnh vẫn còn lớn. Vui lòng chọn ảnh nhỏ hơn hoặc chất lượng thấp hơn.')
            return
          }
          setAvatarUrl(moreCompressed)
        } else {
          setAvatarUrl(compressedBase64)
        }

        toast.success('Ảnh được cập nhật thành công!')
      } catch (error) {
        console.error('Lỗi khi tối ưu ảnh:', error)
        toast.error('Lỗi khi xử lý ảnh')
      } finally {
        setImageProcessing(false)
      }
    }
  }

  return (
    <div className='flex flex-col md:flex-row max-w-6xl mx-auto px-4 py-10 gap-10'>
      {/* Sidebar */}
      <aside className='space-y-4 text-sm font-medium w-64'>
        <div className='border-b pb-2'>
          <p className='text-black font-semibold uppercase text-lg tracking-wide hover:text-blue-600 cursor-pointer'>
            Thông tin tài khoản
          </p>
        </div>

        <div className='border-b pb-2 cursor-pointer hover:text-blue-600'>
          <p className='text-black font-semibold uppercase text-lg tracking-wide hover:text-blue-600 cursor-pointer'>
            Đơn hàng đã mua
          </p>
        </div>

        <div className='border-b pb-2 cursor-pointer hover:text-red-600'>
          <button
            onClick={handleLogout}
            className='text-black font-semibold uppercase text-lg tracking-wide hover:text-blue-600 cursor-pointer text-left'
          >
            Thoát
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className='w-full md:w-3/4 bg-white p-6 rounded-lg shadow space-y-7 relative'>
        {/* Avatar */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          id='avatar-upload'
          className='hidden'
          onChange={handleFileChange}
        />

        <div className='flex justify-center relative'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='relative'>
                  <Avatar className='h-40 w-40 border-2 border-gray-300'>
                    <AvatarImage src={avatarUrl || 'https://github.com/shadcn.png'} />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <div
                    onClick={() => !imageProcessing && fileInputRef.current?.click()}
                    className={`absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200 transition-colors ${
                      imageProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
                    }`}
                  >
                    {imageProcessing ? (
                      <div className='animate-spin h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full' />
                    ) : (
                      <Camera className='h-5 w-5 text-gray-600' />
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nhấp vào icon để thay đổi ảnh đại diện</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Display Name */}
        <div className='space-y-2'>
          <Label className='text-lg font-semibold'>Tên hiển thị *</Label>
          {loading ? (
            <Skeleton className='h-12 w-full rounded-md' />
          ) : (
            <Input className='h-12 text-lg' value={fullName} onChange={(e) => setFullName(e.target.value)} />
          )}
        </div>

        {/* Email */}
        <div className='space-y-2'>
          <Label className='text-lg font-semibold'>Email *</Label>
          {loading ? (
            <Skeleton className='h-12 w-full rounded-md' />
          ) : (
            <Input className='h-12 text-lg' value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
        </div>

        {/* Address */}
        <div className='space-y-2'>
          <Label className='text-lg font-semibold'>Địa chỉ *</Label>
          {loading ? (
            <Skeleton className='h-12 w-full rounded-md' />
          ) : (
            <Input className='h-12 text-lg' value={address} onChange={(e) => setAddress(e.target.value)} />
          )}
        </div>

        {/* Phone */}
        <div className='space-y-2'>
          <Label className='text-lg font-semibold'>Số điện thoại *</Label>
          {loading ? (
            <Skeleton className='h-12 w-full rounded-md' />
          ) : (
            <Input className='h-12 text-lg' value={phone} onChange={(e) => setPhone(e.target.value)} />
          )}
        </div>

        {/* Buttons */}
        <div className='pt-4 flex justify-end'>
          <Button onClick={handleSave} className='bg-black text-white hover:bg-gray-800 font-semibold'>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  )
}
