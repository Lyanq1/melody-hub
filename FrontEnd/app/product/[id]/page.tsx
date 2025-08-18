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

  return (
    <>
      {breadcrumb}
      <div className="container mx-auto py-8 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[350px] aspect-square">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 350px"
              />
            </div>
          </div>
          
          {/* Product Details */}
          <div className="flex flex-col bg-gray p-4 rounded-md">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 uppercase">
              {product.name}
            </h1>
            
            <div className="mb-4 text-sm">
              <div className="flex mb-1">
                <span className="w-32">Tình trạng:</span>
                <span className="font-medium">Còn hàng</span>
              </div>
              <div className="flex mb-1">
                <span className="w-32">Xuất xứ:</span>
                <span className="font-medium">Còn hàng</span>
              </div>
              <div className="flex mb-1">
                <span className="w-32">Thương hiệu:</span>
                <span className="font-medium">{product.recordLabel || 'Echo records'}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-2xl font-bold text-gray-800">{product.price} đ</p>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="mr-4 text-sm">Tiêu đề</span>
                <div className="relative">
                  <select className="border rounded px-3 py-1 pr-8 text-sm appearance-none bg-white">
                    <option>ĐĨA CD</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <button 
                  onClick={decreaseQuantity}
                  className="border border-gray-300 px-3 py-1 text-lg"
                >
                  −
                </button>
                <input 
                  type="text" 
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="border-t border-b border-gray-300 w-12 py-1 text-center"
                />
                <button 
                  onClick={increaseQuantity}
                  className="border border-gray-300 px-3 py-1 text-lg"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={addToCart}
                className="bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 text-sm uppercase"
              >
                Thêm vào giỏ
              </button>
              
              <button 
                onClick={toggleWishlist}
                className="border border-gray-300 p-2"
              >
                {isInWishlist ? (
                  <HeartIconSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIconOutline className="w-5 h-5" />
                )}
              </button>
              
              <button className="border border-gray-300 p-2">
                <SpeakerWaveIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm">Chia sẻ</p>
            </div>
          </div>
        </div>
        
        {/* Product Description Tabs */}
        <Tabs defaultValue="description" className="mb-8">
          <TabsList className="border-b w-full justify-start rounded-none bg-transparent h-auto gap-8">
            <TabsTrigger 
              value="description" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:shadow-none bg-transparent px-0 pb-2"
            >
              MÔ TẢ SẢN PHẨM
            </TabsTrigger>
            <TabsTrigger 
              value="policy" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:shadow-none bg-transparent px-0 pb-2"
            >
              CHÍNH SÁCH ĐỔI TRẢ
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="pt-4">
            <div className="space-y-4">
              <h2 className="font-bold">{product.name}</h2>
              
              {product.description && (
                <p className="text-sm">{product.description}</p>
              )}
              
              <div className="text-sm">
                <p className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-500">🎁</span>
                  <span>Quà pre-order: 100 đĩa order thành công đầu tiên sẽ nhận được thêm +1 POB Photocard.</span>
                </p>
                {/* <p className="mb-2">Dự kiến sẽ ship vào <span className="text-red-500 font-medium">giữa tháng 06/2025</span>.</p> */}
                
                <p className="mb-1"><strong>Artist:</strong> {artistName || product.artist || 'ALI HOÀNG DƯƠNG'}</p>
                <p className="mb-1"><strong>Title:</strong> {titleName || 'SAI TÌNH - CHIA TÌNH - CHƯA TÌNH'}</p>
                <p className="mb-1"><strong>Publisher & Distributor:</strong> {product.recordLabel || 'Echo records'}</p>
                <p className="mb-4"><strong>Xuất xứ:</strong> {product.country || 'VIỆT NAM'}</p>
                
                <p className="italic mb-4">Lưu ý: Mẫu sắc sản phẩm thực tế sẽ có sai lệch với hình mock up mang tính chất minh họa.</p>
                
              </div>
              
              {/* YouTube video embed */}
              {/* <div className="aspect-video w-full">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="aspect-video"
                ></iframe>
              </div> */}
            </div>
          </TabsContent>
          
          <TabsContent value="policy" className="pt-4">
            <div className="space-y-4 text-sm">
              <h3 className="font-bold text-lg mb-2">Chính sách đổi trả</h3>
              <p>Chúng tôi chấp nhận đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng với các điều kiện sau:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sản phẩm còn nguyên vẹn, không có dấu hiệu đã qua sử dụng</li>
                <li>Còn đầy đủ bao bì, phụ kiện đi kèm</li>
                <li>Có hóa đơn mua hàng</li>
              </ul>
              <p className="font-bold">Lưu ý: Không áp dụng đổi trả cho sản phẩm PRE-ORDER.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Similar Products Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 uppercase border-b pb-2">SẢN PHẨM LIÊN QUAN</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {similarProducts.length > 0 ? (
              similarProducts.map((item) => (
                <div key={item._id} className="group">
                  <Link href={`/product/${item._id}`} className="block">
                    <div className="relative aspect-square mb-2 overflow-hidden">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    </div>
                    <h3 className="text-center uppercase text-xs font-medium mb-1 line-clamp-2">{item.name}</h3>
                    <p className="text-center text-xs mb-1 line-clamp-1">{item.artist}</p>
                    <p className="text-center font-bold text-sm">{item.price} đ</p>
                  </Link>
                </div>
              ))
            ) : (
              // Placeholder similar products
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="group">
                  <div className="relative aspect-square mb-2 bg-gray-200"></div>
                  <h3 className="text-center uppercase text-xs font-medium mb-1">Album Name {index + 1}</h3>
                  <p className="text-center text-xs mb-1">Artist Name</p>
                  <p className="text-center font-bold text-sm">{450000 + index * 50000} đ</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
} 