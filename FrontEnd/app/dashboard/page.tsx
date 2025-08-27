'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { LayoutDashboard, Disc, ShoppingCart, Users } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import adminStats, { adminStatsService, StatsPeriod, RevenueType, RecentOrder } from '@/lib/services/admin-stats'

const salesData = [
  { month: 'Jan', sales: 1200 },
  { month: 'Feb', sales: 2100 },
  { month: 'Mar', sales: 800 },
  { month: 'Apr', sales: 1600 },
  { month: 'May', sales: 1700 },
  { month: 'Jun', sales: 1200 },
  { month: 'Jul', sales: 2100 },
  { month: 'Aug', sales: 800 },
  { month: 'Sep', sales: 1600 },
  { month: 'Oct', sales: 1700 },
  { month: 'Nov', sales: 1600 },
  { month: 'Dec', sales: 1700 }
]

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'Delivered':
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'Cancelled':
      return 'bg-red-100 text-red-800'
    case 'Delivering':
    case 'Shipping':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'Delivered':
    case 'Completed':
      return 'Completed'
    case 'Cancelled':
      return 'Cancelled'
    case 'Delivering':
    case 'Shipping':
      return 'Shipping'
    default:
      return status
  }
}

export default function Dashboard() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const [systemStats, setSystemStats] = useState<any>(null)
  const [productStats, setProductStats] = useState<any>(null)
  const [comprehensive, setComprehensive] = useState<any>(null)
  const [customerStats, setCustomerStats] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  const [period, setPeriod] = useState<StatsPeriod>('month')
  const [revenueType, setRevenueType] = useState<RevenueType>('monthly')
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [revenueSeries, setRevenueSeries] = useState<any[]>([])

  console.log('🎯 Dashboard component state:', { user, isAdmin, isAuthenticated })

  useEffect(() => {
    // Chỉ Admin mới có thể truy cập dashboard
    if (isAuthenticated && isAdmin) {
      console.log('✅ Admin authenticated, fetching stats...')
      fetchAll()
    } else {
      console.log('❌ Not admin or not authenticated:', { isAuthenticated, isAdmin })
    }
  }, [isAuthenticated, isAdmin, period, revenueType, year])

  // Kiểm tra quyền truy cập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600">Bạn cần đăng nhập để truy cập dashboard</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
          <p className="text-gray-600">Chỉ Admin mới có thể truy cập dashboard</p>
        </div>
      </div>
    )
  }

  const fetchAll = async () => {
    try {
      const [sys, prod, comp, cust, rev, recent] = await Promise.all([
        adminStatsService.getSystemStats(),
        adminStatsService.getProductStats(),
        adminStatsService.getComprehensiveStats({ period }),
        adminStatsService.getCustomerStats({ period }),
        adminStatsService.getRevenueStats({ type: revenueType, year }),
        adminStatsService.getRecentOrders(5)
      ])
      setSystemStats(sys)
      setProductStats(prod)
      setComprehensive(comp)
      setCustomerStats(cust)
      setRecentOrders(recent)
      // Normalize revenue data into chart-friendly series
      const chart = (rev?.data || []).map((d: any) => ({
        label: d._id,
        revenue: d.revenue,
        orders: d.orders,
        aov: d.averageOrderValue
      }))
      setRevenueSeries(chart)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='font-[Inter_Tight] p-6 space-y-8'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className="flex flex-col items-start">
          <h2 className="text-3xl font-bold font-[DrukWideBold] text-neutral-800">DASHBOARD</h2>
          <div className="w-74 h-2 bg-[#BB3C36] mt-2"></div>
        </div>
        <div className='flex items-center gap-4'>
          <Link href="/dashboard/products">
            <Button className='bg-black text-white hover:bg-gray-800'>Quản lý sản phẩm</Button>
          </Link>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" className='border-black text-black hover:bg-black hover:text-white'>
                Quản lý hệ thống
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Bộ lọc kỳ thống kê */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Kỳ:</span>
          <select
            className='border rounded px-2 py-1'
            value={period}
            onChange={(e) => setPeriod(e.target.value as StatsPeriod)}
          >
            <option value='day'>Ngày</option>
            <option value='week'>Tuần</option>
            <option value='month'>Tháng</option>
            <option value='quarter'>Quý</option>
            <option value='year'>Năm</option>
          </select>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Doanh thu theo:</span>
          <select
            className='border rounded px-2 py-1'
            value={revenueType}
            onChange={(e) => setRevenueType(e.target.value as RevenueType)}
          >
            <option value='daily'>Ngày</option>
            <option value='monthly'>Tháng</option>
            <option value='quarterly'>Quý</option>
            <option value='yearly'>Năm</option>
          </select>
          <input
            type='number'
            className='border rounded px-2 py-1 w-24'
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value || `${new Date().getFullYear()}`))}
          />
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='shadow hover:shadow-lg transition'>
          <CardContent className='p-4 flex items-center space-x-4'>
            <LayoutDashboard className='w-10 h-10 text-indigo-500' />
            <div>
              <p className='text-sm text-gray-500'>Tổng người dùng</p>
              <p className='text-2xl font-bold text-indigo-700'>
                {systemStats ? systemStats.totalUsers : '...'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow hover:shadow-lg transition'>
          <CardContent className='p-4 flex items-center space-x-4'>
            <ShoppingCart className='w-10 h-10 text-green-500' />
            <div>
              <p className='text-sm text-gray-500'>Người dùng mới (24h)</p>
              <p className='text-2xl font-bold text-green-700'>
                {systemStats ? systemStats.newUsers24h : '...'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow hover:shadow-lg transition'>
          <CardContent className='p-4 flex items-center space-x-4'>
            <Disc className='w-10 h-10 text-orange-500' />
            <div>
              <p className='text-sm text-gray-500'>Quản trị viên</p>
              <p className='text-2xl font-bold text-orange-700'>
                {systemStats ? systemStats.adminUsers : '...'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow hover:shadow-lg transition'>
          <CardContent className='p-4 flex items-center space-x-4'>
            <Users className='w-10 h-10 text-purple-500' />
            <div>
              <p className='text-sm text-gray-500'>Nghệ sĩ</p>
              <p className='text-2xl font-bold text-purple-700'>
                {systemStats ? systemStats.artistUsers : '...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ doanh thu */}
      <Card className='rounded-2xl shadow-lg'>
        <CardHeader>
          <CardTitle className='text-xl font-semibold mb-2'>📊 Doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={revenueSeries?.length ? revenueSeries : salesData}>
              <XAxis dataKey='label' stroke='#8884d8' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='revenue' fill='#6366f1' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Khối thống kê theo nhóm */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Giao dịch mua & trạng thái */}
        <Card className='shadow'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>Giao dịch & Trạng thái</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'><span>Tổng đơn</span><b>{comprehensive?.orders?.total ?? '...'}</b></div>
            <div className='flex justify-between'><span>Đơn kỳ hiện tại</span><b>{comprehensive?.orders?.period ?? '...'}</b></div>
            <div className='flex justify-between'><span>Đang giao</span><b>{comprehensive?.orders?.shipping ?? '...'}</b></div>
            <div className='flex justify-between'><span>Hoàn tất</span><b>{comprehensive?.orders?.completed ?? '...'}</b></div>
            <div className='flex justify-between'><span>Hủy</span><b>{comprehensive?.orders?.cancelled ?? '...'}</b></div>
          </CardContent>
        </Card>

        {/* Sản phẩm & Danh mục */}
        <Card className='shadow'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>Sản phẩm & Danh mục</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'><span>Tổng sản phẩm</span><b>{comprehensive?.products?.total ?? productStats?.totalProducts ?? '...'}</b></div>
            <div className='flex justify-between'><span>Tổng danh mục</span><b>{comprehensive?.categories?.total ?? productStats?.totalCategories ?? '...'}</b></div>
            <div className='flex justify-between'><span>Sắp hết hàng (&lt;10)</span><b>{comprehensive?.products?.lowStock ?? '...'}</b></div>
            <div className='flex justify-between'><span>Hết hàng</span><b>{comprehensive?.products?.outOfStock ?? '...'}</b></div>
          </CardContent>
        </Card>

        {/* Khách hàng */}
        <Card className='shadow'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>Khách hàng</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex justify-between'><span>Tổng khách hàng</span><b>{comprehensive?.customers?.total ?? '...'}</b></div>
            <div className='flex justify-between'><span>Khách hàng mới</span><b>{comprehensive?.customers?.new ?? customerStats?.newCustomers ?? '...'}</b></div>
            <div className='flex justify-between'><span>Số KH hoạt động</span><b>{customerStats?.activeCustomers?.uniqueCustomers ?? '...'}</b></div>
            <div className='flex justify-between'><span>Đơn TB/KH</span><b>{customerStats?.activeCustomers?.averageOrdersPerCustomer?.toFixed?.(2) ?? '...'}</b></div>
            <div className='flex justify-between'><span>Chi tiêu TB/KH</span><b>{customerStats?.activeCustomers?.averageSpentPerCustomer.toFixed?.(0).toLocaleString() ?? '...'}đ</b></div>
          </CardContent>
        </Card>
      </div>

      {/* Đơn hàng gần đây */}
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <table className='min-w-full text-left'>
            <thead>
              <tr>
                <th className='py-2 px-4 border-b'>Mã đơn</th>
                <th className='py-2 px-4 border-b'>Khách hàng</th>
                <th className='py-2 px-4 border-b'>Tổng tiền</th>
                <th className='py-2 px-4 border-b'>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td className='py-2 px-4 border-b'>#{order._id.slice(-6)}</td>
                  <td className='py-2 px-4 border-b'>{order.userId.DisplayName}</td>
                  <td className='py-2 px-4 border-b'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                      .format(order.totalPrice)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyle(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Link href="/dashboard/orders">
          <Button className='bg-black text-white hover:bg-gray-800'>Xem tất cả đơn hàng</Button>
        </Link>
      </div>
    </div>
  )
}