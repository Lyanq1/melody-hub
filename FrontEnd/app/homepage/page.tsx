'use client'
import React, { useEffect, useState } from 'react'
import { ProductCard } from './components/ProductCard'
import Carousel from './components/Carousel'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import axios from 'axios'

// Store Choice Product IDs - these will be fetched from the API
const STORE_CHOICE_IDS = [
  '6850047daaa39a5ba552df86',
  '6850047daaa39a5ba552dfab',
  '6850047daaa39a5ba552df72',
  '6850047daaa39a5ba552dfa0'
]

// Best of 2025 Product ID
const BEST_OF_2025_ID = '6850047daaa39a5ba552dfe0'

export default function Homepage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [newReleasesProducts, setNewReleasesProducts] = useState<any[]>([])
  const [storeChoiceProducts, setStoreChoiceProducts] = useState<any[]>([])
  const [bestOf2025Product, setBestOf2025Product] = useState<any>(null)
  const [vietnameseProducts, setVietnameseProducts] = useState<any[]>([])
  const [vinylProducts, setVinylProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Lấy token từ cookies
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null
      return null
    }

    const token = getCookie('token')
    setIsAuthenticated(!!token)
    const fetchProducts = async () => {
      try {
        // Fetch all products
        const response = await axios.get('http://localhost:5000/api/product')
        const allProducts = response.data

        // Set featured products (first 12)
        setFeaturedProducts(allProducts.slice(0, 8))

        // Fetch New Releases products (mix of recent products for wall display)
        const newReleasesData = allProducts
          .sort(() => 0.5 - Math.random()) // Randomize for variety
          .slice(0, 20) // Get 20 products for the wall
        setNewReleasesProducts(newReleasesData)

        // Fetch Store Choice products by IDs
        const storeChoiceData = allProducts.filter((product: any) => STORE_CHOICE_IDS.includes(product._id))
        setStoreChoiceProducts(storeChoiceData)

        // Fetch Best of 2025 product
        const bestOf2025Data = allProducts.find((product: any) => product._id === BEST_OF_2025_ID)
        setBestOf2025Product(bestOf2025Data)

        // Fetch Vietnamese products (random selection)
        const vietnameseData = allProducts
          .filter((product: any) => product.country && product.country.toLowerCase().includes('vietnam'))
          .sort(() => 0.5 - Math.random())
          .slice(0, 8)
        setVietnameseProducts(vietnameseData)

        // Fetch Essential Vinyl products (products with "đĩa than" in name)
        const vinylData = allProducts
          .filter((product: any) => product.name && product.name.toLowerCase().includes('đĩa than'))
          .slice(0, 4)
        setVinylProducts(vinylData)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center p-4'>
        <div className='animate-pulse text-xl'>Loading products...</div>
      </div>
    )
  }

  return (
    <div>
      <Carousel />
      {/* <div className='max-w-6xl mx-auto mt-10 px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold font-[Ceflinty] text-primary mb-4'>SẢN PHẨM NỔI BẬT</h2>
          <p className='text-muted-foreground font-[Lora] text-lg'>Khám phá những sản phẩm được yêu thích nhất</p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              name={product.name}
              price={product.price}
              imageUrl={product.image}
              isNew={false}
              onAddToCart={(id) => {
                console.log(`Added product ${id} to cart`)
              }}
            />
          ))}
        </div>
      </div> */}

      {/* New Releases Wall */}
      <div className='max-w-7xl mx-auto mt-16 px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold font-[Ceflinty] text-primary mb-4 tracking-wider'>NEW RELEASES</h2>
          <p className='text-muted-foreground font-[Inter_Tight] text-lg'>Khám phá những phát hành mới nhất và hot nhất</p>
        </div>

        {/* Masonry-style grid */}
        <div className='columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4'>
          {newReleasesProducts.map((product, index) => {
            // Varying heights for masonry effect
            const heightClasses = ['h-48', 'h-56', 'h-64', 'h-72', 'h-80']
            const randomHeight = heightClasses[index % heightClasses.length]

            return (
              <div
                key={product._id}
                className='break-inside-avoid mb-4 cursor-pointer'
                onClick={() => (window.location.href = `/product/${product._id}`)}
              >
                <div className='relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'>
                  <div className={`relative w-full ${randomHeight}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw'
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {newReleasesProducts.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground font-[Inter_Tight]'>Đang cập nhật sản phẩm mới...</p>
          </div>
        )}
      </div>

      {/* Store choice section */}
      <div className='max-w-6xl mx-auto mt-16 px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold font-[Ceflinty] text-primary mb-4'>STORE CHOICE</h2>
          <p className='text-muted-foreground font-[Inter_Tight] text-lg'>Những sản phẩm được lựa chọn đặc biệt từ cửa hàng</p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {storeChoiceProducts.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              name={product.name}
              price={product.price}
              imageUrl={product.image}
              isNew={false}
              onAddToCart={(id) => {
                console.log(`Added product ${id} to cart`)
              }}
            />
          ))}
        </div>
      </div>

      {/* best of 2025 section */}
      <div className='max-w-6xl mx-auto mt-16 px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold font-[Ceflinty] text-primary mb-4'>BEST OF 2025</h2>
          <p className='text-muted-foreground font-[Inter_Tight] text-lg'>Sản phẩm xuất sắc nhất năm 2025</p>
        </div>
        {bestOf2025Product && (
          <div className='bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8 border border-border/50'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
              <div className='relative h-[400px] rounded-lg overflow-hidden'>
                <Image src={bestOf2025Product.image} alt={bestOf2025Product.name} fill className='object-cover' />
              </div>
              <div className='space-y-6'>
                <div>
                  <h3 className='text-2xl font-bold font-[Ceflinty] text-primary mb-2'>{bestOf2025Product.name}</h3>
                  <p className='text-lg text-muted-foreground font-[Inter_Tight]'>
                    Được chọn là sản phẩm xuất sắc nhất năm với chất lượng âm thanh tuyệt vời và giá trị sưu tập cao.
                  </p>
                </div>
                <div className='text-3xl font-bold text-primary font-[Ceflinty]'>{bestOf2025Product.price}đ</div>
                <div className='flex gap-4'>
                  <Button
                    size='lg'
                    className='font-[Inter_Tight]'
                    onClick={() => console.log(`Added product ${bestOf2025Product._id} to cart`)}
                  >
                    ADD TO CART
                  </Button>
                  <Button
                    variant='outline'
                    size='lg'
                    className='font-[Inter_Tight]'
                    onClick={() => (window.location.href = `/product/${bestOf2025Product._id}`)}
                  >
                    VIEW DETAILS
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/*Viet banner section */}
      <div className='max-w-6xl mx-auto mt-16 px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold font-[Ceflinty] text-primary mb-4'>CHÀO MỪNG NGÀY 2/9</h2>
          <p className='text-muted-foreground font-[Inter_Tight] text-lg'>
            Đặt hàng các sản phẩm chào mừng ngày trọng đại của đất nước
          </p>
        </div>
        <a href='/preorder'>
          <img src='/assets/quockhanh2.png' alt='banner' width='auto' height='auto' />
        </a>
      </div>

      {/* Vietnam Release section */}
      <div className='max-w-6xl mx-auto mt-16 px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold font-[Ceflinty] text-primary mb-4'>VIETNAM RELEASES</h2>
          <p className='text-muted-foreground font-[Inter_Tight] text-lg'>
            Khám phá những phát hành âm nhạc đặc sắc từ Việt Nam
          </p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {vietnameseProducts.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              name={product.name}
              price={product.price}
              imageUrl={product.image}
              isNew={false}
              onAddToCart={(id) => {
                console.log(`Added product ${id} to cart`)
              }}
            />
          ))}
        </div>
        {vietnameseProducts.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground font-[Inter_Tight]'>Không tìm thấy sản phẩm Việt Nam</p>
          </div>
        )}
      </div>

      {/* Essential Vinyl section */}
      <div className='max-w-6xl mx-auto mt-16 px-4 mb-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold font-[Ceflinty] text-primary mb-4'>ESSENTIAL VINYL RECORDS</h2>
          <p className='text-muted-foreground font-[Inter_Tight] text-lg'>Bộ sưu tập đĩa than cho người yêu âm nhạc</p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {vinylProducts.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              name={product.name}
              price={product.price}
              imageUrl={product.image}
              isNew={false}
              onAddToCart={(id) => {
                console.log(`Added product ${id} to cart`)
              }}
            />
          ))}
        </div>
        {vinylProducts.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground font-[Inter_Tight]'>Không tìm thấy đĩa than</p>
          </div>
        )}
      </div>
    </div>
  )
}
