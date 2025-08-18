'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import { cartService } from '@/lib/services/cart'

interface WishlistItem {
  id: string
  name: string
  price: string
  imageUrl: string
}

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('wishlist')
    if (stored) {
      setWishlist(JSON.parse(stored))
    }
  }, [])

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id)
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>MY WISHLIST</h1>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className='text-center py-6 text-gray-500'>Wishlist của bạn hiện trống.</CardContent>
        </Card>
      ) : (
        <div className='grid gap-6'>
          {wishlist.map((item) => (
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
                  <Button
                    className='w-full sm:w-auto cursor-pointers hover:bg-primary hover:text-white'
                    variant='outline'
                    size='sm'
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token')
                        if (!token) {
                          toast.error('Please login to add items to cart')
                          return
                        }

                        const payload = JSON.parse(atob(token.split('.')[1]))
                        const userId = payload.accountID

                        if (!userId) {
                          toast.error('Unable to get user information')
                          return
                        }

                        const result = await cartService.addToCart(userId, item.id, 1)
                        
                        if (result) {
                          toast.success('Product added to cart', {
                            duration: 2500
                          })
                          window.dispatchEvent(new Event('cart-updated'))
                        } else {
                          toast.error('Failed to add product to cart')
                        }
                      } catch (error) {
                        console.error('Error adding to cart:', error)
                        toast.error('Failed to add product to cart')
                      }
                    }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                  <Button variant='destructive' size='sm' onClick={() => removeFromWishlist(item.id)}>
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WishlistPage
