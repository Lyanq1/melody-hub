'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'

// Dynamic import để tránh SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => (
    <div className='flex items-center justify-center h-full bg-gray-100'>
      <div className='text-center'>
        <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2'></div>
        <p className='text-gray-600'>Đang tải bản đồ...</p>
      </div>
    </div>
  )
})
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

interface OrderItem {
  discId: string
  name: string
  price: number
  quantity: number
}

interface StatusHistoryItem {
  status: 'Confirmed' | 'Shipping' | 'Delivered'
  timestamp: string
  message: string
}

interface Order {
  _id: string
  userId: string
  items: OrderItem[]
  totalPrice: number
  address: string
  paymentMethod: string
  paymentStatus: string
  deliveryFee: number
  createdAt: string
  estimatedDeliveryTime: string
  status: 'Confirmed' | 'Shipping' | 'Delivered'
  statusHistory: StatusHistoryItem[]
}

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [customIcon, setCustomIcon] = useState<any>(null)

  // Địa chỉ xuất phát cố định
  const storeLocation = {
    address: '227 đường Nguyễn Văn Cừ, Phường Chợ Quán, Thành phố Hồ Chí Minh',
    lat: 10.762622,
    lng: 106.682028
  }

  // State để lưu tọa độ điểm giao hàng
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Effect để khởi tạo client-side
  useEffect(() => {
    setIsClient(true)

    // Khởi tạo Leaflet icon và CSS chỉ khi đã ở client-side
    const initLeafletIcon = async () => {
      try {
        // Load Leaflet CSS
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        const L = await import('leaflet')

        const icon = new L.Icon({
          iconUrl: '/assets/marker-icon.svg',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        })
        setCustomIcon(icon)
      } catch (error) {
        console.error('Error loading Leaflet:', error)
      }
    }

    initLeafletIcon()
  }, [])

  // Hàm lấy tọa độ từ địa chỉ sử dụng OpenStreetMap Nominatim
  const getCoordinates = async (address: string) => {
    try {
      const encodedAddress = encodeURIComponent(address)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=vn`
      )

      if (response.data && response.data.length > 0) {
        const location = response.data[0]
        return {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon)
        }
      }
      return null
    } catch (error) {
      console.error('Error getting coordinates:', error)
      return null
    }
  }

  // Effect để cập nhật tọa độ khi order được chọn
  useEffect(() => {
    const updateDeliveryLocation = async () => {
      if (selectedOrder) {
        const coordinates = await getCoordinates(selectedOrder.address)
        setDeliveryLocation(coordinates)
      }
    }

    updateDeliveryLocation()
  }, [selectedOrder])

  useEffect(() => {
    const fetchOrders = async () => {
      // Chỉ chạy khi đã ở client-side
      if (!isClient) return

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Vui lòng đăng nhập')
          setLoading(false)
          return
        }

        // Lấy userId từ token
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userId = payload.accountID

        if (!userId) {
          setError('Không tìm thấy thông tin người dùng')
          setLoading(false)
          return
        }

        // Gọi API getUserOrders
        const response = await axios.get(`http://localhost:5000/api/orders/user/${userId}`)
        const data = response.data

        if (data.success) {
          setOrders(data.orders)
          if (data.orders.length > 0) {
            setSelectedOrder(data.orders[0]) // Chọn order đầu tiên làm mặc định
          }
        } else {
          setError(data.message || 'Lỗi khi tải đơn hàng')
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Lỗi kết nối server')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isClient])

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-center items-center h-64'>
          <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>{error}</div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Order Tracking</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Danh sách đơn hàng */}
        <div>
          <h2 className='text-xl font-semibold mb-4'>Danh sách đơn hàng</h2>
          {orders.length === 0 ? (
            <p className='text-gray-500'>Bạn chưa có đơn hàng nào</p>
          ) : (
            <div className='space-y-4'>
              {orders.map((order) => (
                <div
                  key={order._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedOrder?._id === order._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className='flex justify-between items-start mb-2'>
                    <h3 className='font-semibold'>Order #{order._id.slice(-6)}</h3>
                    <span className='text-sm text-gray-500'>
                      {new Date(order.createdAt).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </span>
                  </div>

                  <div className='text-sm text-gray-600 mb-2'>
                    <p>
                      <strong>Địa chỉ:</strong> {order.address}
                    </p>
                    <p>
                      <strong>Tổng tiền:</strong> {(order.totalPrice || 0).toLocaleString('vi-VN')}₫
                    </p>
                    <p>
                      <strong>Thanh toán:</strong> {order.paymentMethod} - {order.paymentStatus}
                    </p>
                  </div>

                  {/* Hiển thị items */}
                  <div className='mt-3'>
                    <h4 className='font-medium mb-2'>Sản phẩm:</h4>
                    <div className='space-y-1'>
                      {order.items?.map((item, index) => (
                        <div key={index} className='flex justify-between text-sm'>
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span>{(item.price || 0).toLocaleString('vi-VN')}₫</span>
                        </div>
                      )) || <p className='text-gray-500'>Không có sản phẩm</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bản đồ */}
        <div>
          <h2 className='text-xl font-semibold mb-4'>Bản đồ giao hàng</h2>
          {selectedOrder ? (
            <div className='border rounded-lg overflow-hidden'>
              <div className='h-96'>
                {isClient ? (
                  <MapContainer
                    center={[storeLocation.lat, storeLocation.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Marker điểm xuất phát */}
                    <Marker position={[storeLocation.lat, storeLocation.lng]} icon={customIcon || undefined}>
                      <Popup>
                        <div>
                          <strong>Điểm xuất phát</strong>
                          <br />
                          {storeLocation.address}
                        </div>
                      </Popup>
                    </Marker>

                    {/* Marker điểm giao hàng */}
                    {deliveryLocation && (
                      <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={customIcon || undefined}>
                        <Popup>
                          <div>
                            <strong>Điểm giao hàng</strong>
                            <br />
                            {selectedOrder.address}
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                ) : (
                  <div className='flex items-center justify-center h-full bg-gray-100'>
                    <div className='text-center'>
                      <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2'></div>
                      <p className='text-gray-600'>Đang tải bản đồ...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className='p-4 bg-gray-50'>
                <h3 className='font-semibold mb-2'>Thông tin giao hàng</h3>
                <p className='text-sm text-gray-600'>
                  <strong>Từ:</strong> {storeLocation.address}
                </p>
                <p className='text-sm text-gray-600'>
                  <strong>Đến:</strong> {selectedOrder.address}
                </p>
                <p className='text-sm text-gray-600'>
                  <strong>Phí giao hàng:</strong> {(selectedOrder.deliveryFee || 0).toLocaleString('vi-VN')}₫
                </p>
                <p className='text-sm text-gray-600'>
                  <strong>Thời gian giao hàng dự kiến:</strong> {selectedOrder.estimatedDeliveryTime}
                </p>
              </div>
            </div>
          ) : (
            <div className='border rounded-lg p-8 text-center text-gray-500'>
              Chọn một đơn hàng để xem bản đồ giao hàng
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
