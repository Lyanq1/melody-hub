'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { use, useEffect, useState } from 'react'
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { SpeakerWaveIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { ProductCard } from '@/components/ui/product-card'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cartService } from '@/lib/services/cart'
import { getCurrentUserId, isAuthenticated } from '@/lib/utils'
import { ShoppingBag } from 'lucide-react';

interface Product {
  _id: string
  name: string
  price: string
  image: string
  description?: string
  categoryId?: string
  artistId?: string
  artist?: string
  releaseYear?: string
  stock?: number
  productCode?: string
  genre?: string
  format?: string
  country?: string
  recordLabel?: string
  trackList?: string[]
}

export default function ProductDetail({ params }: { params: Promise< { id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const router = useRouter()
  const {id} = use(params)

  // Extract artist name from product name (everything before the first '-')
  const extractArtistFromName = (name: string): string => {
    if (!name) return '';
    const dashIndex = name.indexOf('-');
    if (dashIndex === -1) return name.trim(); // If no dash found, return the whole name
    return name.substring(0, dashIndex).trim();
  };

  // Extract title from product name (everything after the first '-')
  const extractTitleFromName = (name: string): string => {
    if (!name) return '';
    const dashIndex = name.indexOf('-');
    if (dashIndex === -1) return ''; // If no dash found, return empty string
    return name.substring(dashIndex + 1).trim();
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/product/${id}`)
        setProduct(response.data)
        
        // Check if product is in wishlist
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
        setIsInWishlist(wishlist.some((item: { id: string }) => item.id === id))
        
        // Fetch similar products
        fetchSimilarProducts(response.data.categoryId)
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const fetchSimilarProducts = async (categoryId: string) => {
    if (!categoryId) return
    
    try {
      const response = await axios.get(`http://localhost:5000/api/product?category=${categoryId}`)
      // Filter out current product and limit to 4 items
      const filtered = response.data
        .filter((item: Product) => item._id !== id)
        .slice(0, 4)
      
      setSimilarProducts(filtered)
    } catch (error) {
      console.error('Error fetching similar products:', error)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value > 0) {
      setQuantity(value)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const addToCart = async () => {
    if (!product) return

    try {
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
      
      console.log(`🛒 Adding product to cart: ${product.name} (${product._id}) for user ${userId}`);
      const result = await cartService.addToCart(userId, product._id, quantity)
      
      if (result) {
        toast.success('Product added to cart', {
          description: `${quantity} x "${product.name}" has been added successfully.`,
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

  const toggleWishlist = () => {
    if (!product) return

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    
    if (isInWishlist) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter((item: { id: string }) => item.id !== product._id)
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
      setIsInWishlist(false)
      toast.success('Product removed from wishlist')
    } else {
      // Add to wishlist
      if (!wishlist.some((item: { id: string }) => item.id === product._id)) {
        wishlist.push({
          id: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.image
        })
        localStorage.setItem('wishlist', JSON.stringify(wishlist))
        setIsInWishlist(true)
        toast.success('Product added to wishlist')
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-pulse">Loading product details...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => router.push('/product')}>
            Return to Products
          </Button>
        </div>
      </div>
    )
  }

  // Get artist name and title from product name
  const artistName = product ? extractArtistFromName(product.name) : '';
  const titleName = product ? extractTitleFromName(product.name) : '';

  // Breadcrumb navigation
  const breadcrumb = (
    <div className="bg-gray-100 py-2">
      <div className="container mx-auto px-4 text-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:underline">Trang chủ</Link>
          <span>/</span>
          <Link href="/product" className="hover:underline">AVAILABLE NOW</Link>
          <span>/</span>
          <span className="text-gray-500">{product.name}</span>
        </div>
      </div>
    </div>
  )

  const numericPrice = Number(product.price.replace(/[^\d]/g, "")) || 0;

  return (
    <div className="container mx-auto py-12 px-6 lg:px-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Product Image */}
        <div className="flex justify-center">
          <div className="relative w-[700px] aspect-square">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col justify-between">
          {/* Header */}
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold text-neutral-800 uppercase">
              {product.name}
            </h1>
            <div className="w-56 h-2 bg-red-700" />
            
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                viewBox="0 0 48 48"
              >
                <path
                  d="M40 12L18 34L8 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-2xl font-light">Available In Store</span>
            </div>

            {/* Price + Quantity */}
            <div className="flex justify-between items-center w-[500px]">
              <div>
                <p className="text-2xl font-semibold">PRICE</p>
                <p className="text-3xl font-bold">{product.price} đ</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">QUANTITY</p>
                <div className="flex items-center bg-stone-200 rounded-full px-4 py-2 gap-6">
                  <button
                    onClick={decreaseQuantity}
                    className="text-2xl text-gray-400"
                  >
                    −
                  </button>
                  <span className="text-2xl font-medium">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="text-2xl text-gray-400"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Total + Add to Cart */}
          <div className="mt-12 flex items-center gap-10">
            <div>
              <p className="text-2xl font-semibold">TOTAL PRICE</p>
              <p className="text-4xl font-bold">
                {(quantity * numericPrice).toLocaleString()} đ
              </p>
            </div>
            <button
              onClick={addToCart}
              className="flex items-center gap-4 bg-amber-300 text-white px-10 py-4 rounded-full text-2xl font-medium"
            >
              <ShoppingBag className="w-8 h-8" />
              Add to cart
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-16">
        <div className="flex">
          <div className="w-36 h-2 bg-red-700 rounded-l-2xl" />
          <div className="flex-1 h-2 bg-stone-300 rounded-r-2xl" />
        </div>
        <div className="mt-6">
          <p className="text-2xl font-semibold">DESCRIPTION</p>
          <p className="mt-4 text-lg">{product.description}</p>
          <p className="mt-2 text-lg">
            <span className="font-bold">COUNTRY:</span> {product.country || "United States"}
          </p>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20">
        <h2 className="text-5xl font-bold text-neutral-800 mb-4">
          RELATED PRODUCT
        </h2>
        <div className="h-2 bg-red-700 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {similarProducts.map((item) => (
            <Link key={item._id} href={`/product/${item._id}`} className="block">
              <div className="relative aspect-square mb-2 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold uppercase">{item.name}</h3>
              <p>{item.artist}</p>
              <p className="font-bold">{item.price} đ</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 