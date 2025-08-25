'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cartService, type Cart } from '../../lib/services/cart'
import { productService } from '../../lib/services/product'
import { getCurrentUserId, isAuthenticated } from '../../lib/utils'
import { toast } from 'sonner'
type CartItemWithProduct = {
  discId: string
  quantity: number
  product?: {
    _id: string
    name: string
    price: string
    image: string
  }
}

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [cartItemsWithProducts, setCartItemsWithProducts] = useState<CartItemWithProduct[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

    // Get user ID from authentication on client
    useEffect(() => {
      const id = getCurrentUserId()
      setUserId(id)
    }, [])

  useEffect(() => {
    // Check if user is authenticated
    // if (!isAuthenticated()) {
    //   toast.error('Please login to view your cart')
    //   router.push('/login')
    //   return
    // }
    // if (!userId) {
    //   toast.error('Unable to get user information')
    //   router.push('/login')
    //   return
    // }


    fetchCart()
  }, [userId, router])


  const fetchCart = async () => {
    if (!userId) return

    try {
      setLoading(true)
      console.log(`🛒 Fetching cart for user ${userId}...`)
      const cartData = await cartService.getCartByUserId(userId)
      
      if (cartData) {
        console.log(`✅ Cart data received:`, cartData)
        setCart(cartData)
        
        // Populate product details for each cart item
        console.log(`🔄 Populating product details for ${cartData.items.length} items...`)
        const itemsWithProducts = await Promise.all(
          cartData.items.map(async (item) => {
            const product = await productService.getProductById(item.discId)
            console.log(`📦 Product for ${item.discId}:`, product?.name || 'Not found')
            return {
              ...item,
              product: product || undefined
            }
          })
        )
        
        setCartItemsWithProducts(itemsWithProducts)
        console.log(`✅ Cart items with products:`, itemsWithProducts)

        // Notify navbar to refresh cart count
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: cartData.items.length } }))
        }
      } else {
        console.log(`❌ No cart data received`)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (discId: string) => {
    if (!userId) return

    try {
      console.log(`🗑️ Deleting item ${discId} from cart...`)
      const updatedCart = await cartService.removeFromCart(userId, discId)
      if (updatedCart) {
        setCart(updatedCart)
        await fetchCart() // Refresh cart with product details and emit event
        toast.success('Item removed from cart')
      } else {
        toast.error('Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    }
  }

  const handleChangeQuantity = async (discId: string, delta: number) => {
    if (!userId) return

    try {
      const currentItem = cart?.items.find(item => item.discId === discId)
      if (!currentItem) return

      const newQuantity = Math.max(1, currentItem.quantity + delta)
      console.log(`📝 Updating quantity for ${discId}: ${currentItem.quantity} + ${delta} = ${newQuantity}`)
      
      const updatedCart = await cartService.updateCartItem(userId, discId, newQuantity)
      
      if (updatedCart) {
        setCart(updatedCart)
        await fetchCart() // Refresh cart with product details and emit event
        toast.success('Cart updated')
      } else {
        toast.error('Failed to update quantity')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }

  const calculateTotal = () => {
    if (!cart) return '0'
    return cart.total.toLocaleString('vi-VN')
  }


  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (cart?.items.length === 0) {
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
    <div className="container mx-auto px-4 py-8 max-w-7xl font-[Inter_Tight]">
      <div className="flex flex-col items-start mb-10">
        <h2 className="text-5xl font-bold font-[DrukWideBold] text-neutral-800">MY CART</h2>
        <div className="w-83 h-2 bg-[#BB3C36] mt-2"></div>
      </div>
      {/* Cache Status Display */}
      {cart?._cacheInfo && (
        <div className={`p-3 rounded-lg mb-4 ${
          cart._cacheInfo.status === 'HIT' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {cart._cacheInfo.status === 'HIT' ? '✅ Cache HIT' : '❌ Cache MISS'}
            </span>
            <span>•</span>
            <span>Source: {cart._cacheInfo.source}</span>
            <span>•</span>
            <span>Time: {cart._cacheInfo.timestamp}</span>
          </div>
          <div className="text-sm mt-1">{cart._cacheInfo.message}</div>
        </div>
      )}

      <div className='grid gap-6'>
        {cartItemsWithProducts.map((item) => (
          <div
            key={item.discId}
            className='flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-sm border'
          >
            <div className='w-full sm:w-32'>
              <Image
                src={item.product?.image || ''}
                alt={item.product?.name || ''}
                width={128}
                height={128}
                className='w-full h-32 object-cover rounded-md'
              />
            </div>

            <div className='flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full'>
              <div className='mb-4 sm:mb-0'>
                <h3 className='text-lg font-semibold'>{item.product?.name}</h3>
                <p className='text-gray-600'>{item.product?.price}</p>
              </div>

              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2 border rounded-md p-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleChangeQuantity(item.discId, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className='h-4 w-4' />
                  </Button>
                  <span className='w-12 text-center'>{item.quantity}</span>
                  <Button variant='ghost' size='sm' onClick={() => handleChangeQuantity(item.discId, 1)}>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>

                <Button className="bg-[#BB3C36]" variant='destructive' size='sm' onClick={() => handleDelete(item.discId)}>
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <span className='text-lg font-semibold'>TOTAL:</span>
          <span className='text-xl font-bold'>{calculateTotal()}₫</span>
        </div>
        <Button className='w-full bg-[#DDB351] rounded-[30px] hover:bg-primary/90 font-bold text-2xl text-[#BB3C36]' onClick={handleCheckout}>
          ABATE
        </Button>
      </div>
    </div>
  )
}
