'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
type CartItem = {
  id: string
  name: string
  price: string | number
  quantity: number
  imageUrl: string
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      const parsed = (JSON.parse(stored) as CartItem[]).map((item: CartItem) => ({
        ...item,
        quantity: item.quantity ?? 1
      }))
      setCart(parsed)
    }
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))

    //Phát sự kiện để Navbar tự cập nhật
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleDelete = (id: string) => {
    const newCart = cart.filter((item) => item.id !== id)
    updateCart(newCart)
  }

  const handleChangeQuantity = (id: string, delta: number) => {
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
    updateCart(newCart)
  }

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => {
        // Handle both string and number price types
        let price = 0
        if (typeof item.price === 'string') {
          price = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 0
        } else if (typeof item.price === 'number') {
          price = item.price
        }
        return total + price * item.quantity
      }, 0)
      .toLocaleString('vi-VN')
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center p-4'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Bạn hiện chưa có sản phẩm nào trong giỏ hàng!</h2>
        <div className='flex gap-4 flex-wrap justify-center'>
          <Button asChild className='bg-primary hover:bg-primary/90'>
            <Link href='/product'>Tiếp tục mua sắm</Link>
          </Button>
          <Button asChild className='bg-primary hover:bg-primary/90'>
            <Link href='/wishlist'>Wishlist của tôi</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl font-[Ceflinty]'>
      <h1 className='text-3xl font-bold mb-8'>Giỏ hàng của bạn</h1>

      <div className='grid gap-6'>
        {cart.map((item) => (
          <div
            key={item.id}
            className='flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-sm border'
          >
            <div className='w-full sm:w-32'>
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={128}
                height={128}
                className='w-full h-32 object-cover rounded-md'
              />
            </div>

            <div className='flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full'>
              <div className='mb-4 sm:mb-0'>
                <h3 className='text-lg font-semibold'>{item.name}</h3>
                <p className='text-gray-600'>{item.price}</p>
              </div>

              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2 border rounded-md p-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleChangeQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className='h-4 w-4' />
                  </Button>
                  <span className='w-12 text-center'>{item.quantity}</span>
                  <Button variant='ghost' size='sm' onClick={() => handleChangeQuantity(item.id, 1)}>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>

                <Button variant='destructive' size='sm' onClick={() => handleDelete(item.id)}>
                  <Trash2 className='h-4 w-4 mr-2' />
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <span className='text-lg font-semibold'>Tổng cộng:</span>
          <span className='text-xl font-bold'>{calculateTotal()}₫</span>
        </div>
        <Button className='w-full bg-primary hover:bg-primary/90' size='lg' onClick={handleCheckout}>
          Thanh toán
        </Button>
      </div>
    </div>
  )
}
