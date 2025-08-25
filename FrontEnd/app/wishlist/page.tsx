'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import { cartService } from '@/lib/services/cart'
import { getCurrentUserId, isAuthenticated } from '@/lib/utils'

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

  const addToCart = async (discId: string, name: string) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        toast.error('Please login to add items to cart')
        return
      }
      // Get user ID from authentication
      const userId = getCurrentUserId()
      if (!userId) {
        toast.error('Unable to get user information')
        return
      }
      
      console.log(`🛒 Adding product to cart: ${name} (${discId}) for user ${userId}`);
      const result = await cartService.addToCart(userId, discId, 1)
      
      if (result) {
        toast.success('Product added to cart', {
          description: `"${name}" has been added successfully.`,
          duration: 2500
        })
        
        // Gửi sự kiện ra toàn window để Navbar biết
        window.dispatchEvent(new Event('cart-updated'))
      } else {
        toast.error('Failed to add product to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add product to cart')
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col items-start">
        <h2 className="text-5xl font-bold font-[DrukWideBold] text-neutral-800">WISHLIST</h2>
        <div className="w-88 h-2 bg-[#BB3C36] mt-2"></div>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center text-gray-500 text-xl mt-12 font-['Inter_Tight']">
          Wishlist của bạn hiện trống.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-16 mt-16">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="flex flex-col lg:flex-row items-center gap-12 max-w-4xl w-full"
            >
              {/* Image */}
              <div className="w-64 h-64 relative">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              {/* Info + Actions */}
              <div className="flex-1 flex flex-col gap-8 text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-semibold font-['Inter_Tight'] uppercase text-neutral-800">
                  {item.name}
                </h3>

                <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-12">
                  {/* Price */}
                  <div className="font-['Inter_Tight']">
                    <div className="text-xl font-semibold text-black">PRICE</div>
                    <div className="text-3xl font-bold text-black">
                      {item.price}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => addToCart(item.id, item.name)}
                      className="flex items-center gap-4 bg-[#DDB351] text-white text-xl font-medium rounded-full px-8 py-4 transition"
                    >
                      {/* Shopping bag icon */}
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 48 49"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-7 h-7"
                      >
                        <path
                          d="M6 12.5L12 4.5H36L42 12.5M6 12.5V40.5C6 41.5609 6.42143 42.5783 7.17157 43.3284C7.92172 44.0786 8.93913 44.5 10 44.5H38C39.0609 44.5 40.0783 44.0786 40.8284 43.3284C41.5786 42.5786 42 41.5609 42 40.5V12.5M6 12.5H42M32 20.5C32 22.6217 31.1571 24.6566 29.6569 26.1569C28.1566 27.6571 26.1217 28.5 24 28.5C21.8783 28.5 19.8434 27.6571 18.3431 26.1569C16.8429 24.6566 16 22.6217 16 20.5"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Add to cart
                    </button>

                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="bg-[#BB3C36] rounded-full p-5 transition"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 48 49"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-7 h-7"
                      >
                        <path
                          d="M6 12.5H10M10 12.5H42M10 12.5V40.5C10 41.5609 10.4214 42.5783 11.1716 43.3284C11.9217 44.0786 12.9391 44.5 14 44.5H34C35.0609 44.5 36.0783 44.0786 36.8284 43.3284C37.5786 42.5786 38 41.5609 38 40.5V12.5M16 12.5V8.5C16 7.43913 16.4214 6.42172 17.1716 5.67157C17.9217 4.92143 18.9391 4.5 20 4.5H28C29.0609 4.5 30.0783 4.92143 30.8284 5.67157C31.5786 6.42172 32 7.43913 32 8.5V12.5M20 22.5V34.5M28 22.5V34.5"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
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
