'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useSession } from 'next-auth/react'
import { API_BASE_URL } from '@/lib/config'

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
  const [saving, setSaving] = useState(false)
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
      console.log('🔗 Account ID:', user.accountID)
      console.log('👤 Username:', user.username)
      console.log('📧 Email:', user.email)
      console.log('📱 Phone from user:', user.phone)
      console.log('🏠 Address from user:', user.address)

      const finalUsername = user.username || user.email?.split('@')[0] || ''
      setUsername(finalUsername)

      // Only set form fields if they're not empty, preserve existing values
      setFullName(user.displayName || '')
      setDisplayedName(user.displayName || 'Chưa có tên')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setAddress(user.address || '')
      setAvatarUrl(user.avatarURL || '')

      setLoading(false)

      console.log('✅ Profile data loaded for user:', finalUsername)
      console.log('📋 Form initialized with:', {
        fullName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatarUrl: user.avatarURL || ''
      })
    }
  }, [isAuthenticated, user, router])

  // 🔄 Auto refresh user data khi authenticated và có user
  useEffect(() => {
    if (isAuthenticated && user?.accountID && !loading) {
      console.log('🔄 Auto-refreshing user data on mount...')
      refreshUserData()
    }
  }, [isAuthenticated, user?.accountID, loading])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Function để refresh user data từ backend sau khi update
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('🔄 Refreshing user data from backend...')
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.user) {
        const freshUser = response.data.user
        console.log('✅ Fresh user data from backend:', freshUser)

        // Map backend response to consistent format
        const mappedUser = {
          accountID: freshUser.accountID || freshUser._id,
          username: freshUser.username || freshUser.Username,
          email: freshUser.email || freshUser.Email,
          displayName: freshUser.displayName || freshUser.DisplayName,
          avatarURL: freshUser.avatarURL || freshUser.AvatarURL,
          role: freshUser.role || freshUser.Role,
          phone: freshUser.phone || freshUser.Phone,
          address: freshUser.address || freshUser.Address
        }

        // Update local state với fresh data
        setFullName(mappedUser.displayName || '')
        setDisplayedName(mappedUser.displayName || 'Chưa có tên')
        setEmail(mappedUser.email || '')
        setPhone(mappedUser.phone || '')
        setAddress(mappedUser.address || '')
        setAvatarUrl(mappedUser.avatarURL || '')

        // Dispatch event để update useAuth state
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('user-profile-updated', {
              detail: mappedUser
            })
          )
        }

        console.log('🎉 Local state updated with fresh data')
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error)
    }
  }

  // Lấy authorization header - now all auth methods should have JWT token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')

    if (token) {
      console.log('🔑 Using JWT token from localStorage:', token.substring(0, 20) + '...')
      return {
        Authorization: `Bearer ${token}`
      }
    }

    console.log('❌ No JWT token found in localStorage')
    return {}
  }

  const handleSave = async () => {
    if (saving) return // Prevent multiple saves

    try {
      setSaving(true)
      console.log('💾 Starting profile save...')
      console.log('👤 Current user object:', user)
      console.log('🔗 User accountID:', user?.accountID)
      console.log('👤 Username state:', username)
      console.log('📝 Form data being saved:', { fullName, email, address, phone, avatarUrl })

      // Validate form data trước khi save
      if (!fullName.trim()) {
        toast.error('Tên hiển thị không được để trống')
        setSaving(false)
        return
      }

      if (!email.trim()) {
        toast.error('Email không được để trống')
        setSaving(false)
        return
      }

      // Kiểm tra token trước khi thực hiện update
      const headers = getAuthHeaders()
      if (!headers.Authorization) {
        toast.error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.')
        setSaving(false)
        return
      }

      // Kiểm tra nếu user có accountID (từ backend) thì dùng endpoint cập nhật
      if (user?.accountID) {
        console.log('🔑 Sending request with headers:', headers)

        // Sử dụng username hoặc email làm identifier
        const userIdentifier = username || user.email?.split('@')[0] || user.email
        console.log('🆔 Using identifier:', userIdentifier)

        // Only include fields that are not empty to avoid overwriting existing data
        const updateData: any = {}

        if (fullName.trim()) updateData.DisplayName = fullName.trim()
        if (email.trim()) updateData.Email = email.trim()
        if (address.trim()) updateData.Address = address.trim()
        if (phone.trim()) updateData.Phone = phone.trim()
        if (avatarUrl) updateData.AvatarURL = avatarUrl

        console.log('📝 Clean update data (only non-empty fields):', updateData)

        await axios.put(`${API_BASE_URL}/auth/user/${userIdentifier}`, updateData, { headers })
        console.log('✅ Profile update request sent successfully')

        // 🔄 Refresh user data từ backend để có dữ liệu mới nhất
        await refreshUserData()

        // Dispatch event for navbar avatar update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('avatar-update'))
        }

        toast.success('Cập nhật thông tin thành công!')
        setDisplayedName(fullName.trim() || fullName)
      } else {
        console.log('❌ No accountID found in user object')
        toast.warning('Thông tin user chưa được đồng bộ hoàn toàn. Vui lòng thử lại sau khi đăng nhập lại.')
        setSaving(false)
        return
      }
    } catch (err) {
      console.error('💥 Lỗi khi cập nhật thông tin:', err)

      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message
        console.error('📡 API Error:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: err.config
        })
        toast.error(`Lỗi cập nhật: ${errorMessage}`)
      } else {
        console.error('❌ Unknown error:', err)
        toast.error('Đã xảy ra lỗi không xác định khi cập nhật.')
      }
    } finally {
      setSaving(false)
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
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className='bg-black text-white hover:bg-gray-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {saving ? (
              <>
                <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2' />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
