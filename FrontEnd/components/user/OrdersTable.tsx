'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { userOrderService, type UserOrder } from '@/lib/services/user-order'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function OrdersTable() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      console.log('User data:', user);
      if (user?.accountID) {
        try {
          console.log('Fetching orders for user:', user.accountID);
          const data = await userOrderService.getUserOrders(user.accountID)
          console.log('Fetched orders:', data);
          setOrders(data)
        } catch (error) {
          console.error('Failed to fetch orders:', error)
        } finally {
          setLoading(false)
        }
      } else {
        console.log('No accountID found in user object');
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-orange-100 text-orange-800'
      case 'Shipping':
        return 'bg-blue-100 text-blue-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatOrderId = (id: string) => {
    return `#${id.slice(-6).toUpperCase()}`
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]">Loading...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">
                {formatOrderId(order._id)}
              </TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                {order.totalPrice.toLocaleString()}đ
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                Bạn chưa có đơn hàng nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}