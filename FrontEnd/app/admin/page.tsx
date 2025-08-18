'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/use-auth'

interface User {
  _id: string
  Username: string
  Email: string
  DisplayName: string
  Role: string
  Phone: string
  Address: string
  CreatedAt: string
}

export default function AdminPage() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const [editForm, setEditForm] = useState({
    DisplayName: '',
    Email: '',
    Role: '',
    Phone: '',
    Address: ''
  })

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error('Không thể tải danh sách người dùng')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Đã xảy ra lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      DisplayName: user.DisplayName,
      Email: user.Email,
      Role: user.Role,
      Phone: user.Phone || '',
      Address: user.Address || ''
    })
    setIsEditing(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        toast.success('Cập nhật người dùng thành công')
        setIsEditing(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Không thể cập nhật người dùng')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Đã xảy ra lỗi khi cập nhật')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      })

      if (response.ok) {
        toast.success('Xóa người dùng thành công')
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Không thể xóa người dùng')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Đã xảy ra lỗi khi xóa')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ newRole })
      })

      if (response.ok) {
        toast.success('Thay đổi role thành công')
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Không thể thay đổi role')
      }
    } catch (error) {
      console.error('Error changing role:', error)
      toast.error('Đã xảy ra lỗi khi thay đổi role')
    }
  }

  // Lọc users theo search và role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.DisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.Username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.Email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.Role === roleFilter
    
    return matchesSearch && matchesRole
  })

  // Kiểm tra quyền truy cập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600">Bạn cần đăng nhập để truy cập</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
          <p className="text-gray-600">Chỉ Admin mới có thể truy cập trang này</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý hệ thống</h1>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Quay lại Dashboard
            </Button>
          </div>

          {/* Thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tổng số người dùng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Người dùng mới hôm nay</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(user => {
                    const today = new Date().toDateString()
                    const userDate = new Date(user.CreatedAt).toDateString()
                    return today === userDate
                  }).length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quản trị viên</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(user => user.Role === 'Admin').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nghệ sĩ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">
                  {users.filter(user => user.Role === 'Artist').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tìm kiếm và lọc */}
          <Card>
            <CardHeader>
              <CardTitle>Tìm kiếm và lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Tìm kiếm</Label>
                  <Input
                    id="search"
                    placeholder="Tìm theo tên, username hoặc email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Label htmlFor="role-filter">Lọc theo role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Artist">Artist</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danh sách người dùng */}
          <Card>
            <CardHeader>
              <CardTitle>Quản lý người dùng ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên người dùng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vai trò
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.DisplayName}
                            </div>
                            <div className="text-sm text-gray-500">{user.Username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.Email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select 
                              value={user.Role} 
                              onValueChange={(newRole) => handleRoleChange(user._id, newRole)}
                              disabled={user._id === user._id} // Không cho phép thay đổi role của chính mình
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Customer">Customer</SelectItem>
                                <SelectItem value="Artist">Artist</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.CreatedAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="mr-2"
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={user._id === user._id} // Không cho phép xóa chính mình
                            >
                              Xóa
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal chỉnh sửa người dùng */}
        {isEditing && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Chỉnh sửa người dùng</h3>

              <div className="space-y-4">
                <div>
                  <Label>Tên hiển thị</Label>
                  <Input
                    value={editForm.DisplayName}
                    onChange={(e) => setEditForm({...editForm, DisplayName: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editForm.Email}
                    onChange={(e) => setEditForm({...editForm, Email: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Vai trò</Label>
                  <Select value={editForm.Role} onValueChange={(value) => setEditForm({...editForm, Role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Artist">Artist</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Số điện thoại</Label>
                  <Input
                    value={editForm.Phone}
                    onChange={(e) => setEditForm({...editForm, Phone: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Địa chỉ</Label>
                  <Input
                    value={editForm.Address}
                    onChange={(e) => setEditForm({...editForm, Address: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveUser}>
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
