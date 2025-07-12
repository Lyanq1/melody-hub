'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { LayoutDashboard, Disc, ShoppingCart, Users, Bell } from 'lucide-react'

const salesData = [
  { month: 'Jan', sales: 1200 },
  { month: 'Feb', sales: 2100 },
  { month: 'ar', sales: 800 },
  { month: 'Apr', sales: 1600 },
  { month: 'ay', sales: 1700 },
  { month: 'Jun', sales: 1200 },
  { month: 'Jul', sales: 2100 },
  { month: 'Aug', sales: 800 },
  { month: 'Sep', sales: 1600 },
  { month: 'Oct', sales: 1700 },
  { month: 'Nov', sales: 1600 },
  { month: 'Dec', sales: 1700 }
]

const recentOrders = [
  { id: '#1001', customer: 'Nguyễn Văn A', total: '1.200.000₫', status: 'Hoàn thành' },
  { id: '#1002', customer: 'Trần Thị B', total: '850.000₫', status: 'Đang xử lý' },
  { id: '#1003', customer: 'Lê Văn C', total: '2.000.000₫', status: 'Đã hủy' }
]

const notifications = [
  { id: 1, message: 'Có 2 đơn hàng mới vừa được đặt!', time: '2 phút trước' },
  { id: 2, message: "Sản phẩm 'The Beatles - Abbey Road' sắp hết hàng.", time: '10 phút trước' }
]

export default function Dashboard() {
  return (
    <div className='font-[MicaValo] min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6 space-y-8'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <h1 className='text-4xl font-bold text-gray-900'>ADIN DASHBOARD</h1>
        <div className='flex items-center gap-4'>
          <Button variant='outline' className='flex items-center gap-2 border-gray-300'>
            <Bell className='w-5 h-5 text-yellow-500' />
            Thông báo
          </Button>
          <Button className='bg-black text-white hover:bg-gray-800'>Quản lý sản phẩm</Button>
        </div>
      </div>

      {/* Thông báo mới */}
      <div className='flex flex-wrap gap-4'>
        {notifications.map((n) => (
          <div
            key={n.id}
            className='flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow border-l-4 border-yellow-400'
          >
            <Bell className='w-4 h-4 text-yellow-500' />
            <span className='text-gray-700'>{n.message}</span>
            <span className='ml-2 text-xs text-gray-400'>{n.time}</span>
          </div>
        ))}
      </div>

      {/* Thống kê tổng quan */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='shadow hover:shadow-lg transition'>
          <CardContent className='p-4 flex items-center space-x-4'>
            <LayoutDashboard className='w-10 h-10 text-indigo-500' />
            <div>
              <p className='text-sm text-gray-500'>Doanh thu tháng</p>
              <p className='text-2xl font-bold text-indigo-700'>35,000,000₫</p>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow hover:shadow-lg transition'>
          <CardContent className='p-4 flex items-center space-x-4'>
            <ShoppingCart className='w-10 h-10 text-green-500' />
            <div>
              <p className='text-sm text-gray-500'>Đơn hàng hôm nay</p>
              <p className='text-2xl font-bold text-green-700'>57</p>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow hover:shadow-lg transition'>
          <CardContent className='p-4 flex items-center space-x-4'>
            <Disc className='w-10 h-10 text-orange-500' />
            <div>
              <p className='text-sm text-gray-500'>Đĩa than còn lại</p>
              <p className='text-2xl font-bold text-orange-700'>120</p>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow hover:shadow-lg transition'>
          <CardContent className='p-4 flex items-center space-x-4'>
            <Users className='w-10 h-10 text-purple-500' />
            <div>
              <p className='text-sm text-gray-500'>Khách hàng mới</p>
              <p className='text-2xl font-bold text-purple-700'>12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ doanh thu */}
      <Card className='rounded-2xl shadow-lg'>
        <CardHeader>
          <CardTitle className='text-xl font-semibold mb-2'>📊 Doanh thu theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={salesData}>
              <XAxis dataKey='month' stroke='#8884d8' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='sales' fill='#6366f1' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Đơn hàng gần đây */}
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <table className='min-w-full text-left'>
            <thead>
              <tr>
                <th className='py-2 px-4 border-b'>ã đơn</th>
                <th className='py-2 px-4 border-b'>Khách hàng</th>
                <th className='py-2 px-4 border-b'>Tổng tiền</th>
                <th className='py-2 px-4 border-b'>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className='py-2 px-4 border-b'>{order.id}</td>
                  <td className='py-2 px-4 border-b'>{order.customer}</td>
                  <td className='py-2 px-4 border-b'>{order.total}</td>
                  <td
                    className={`py-2 px-4 border-b font-bold ${
                      order.status === 'Hoàn thành'
                        ? 'text-green-600'
                        : order.status === 'Đang xử lý'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {order.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button className='bg-black text-white hover:bg-gray-800'>Xem tất cả đơn hàng</Button>
      </div>
    </div>
  )
}
