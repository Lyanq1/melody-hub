/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useState } from 'react'
import { ProductCard } from '@/components/ui/product-card'
import HeroCarousel from '@/components/ui/heroCarousel'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)

    // Fetch 4 featured products
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(data.slice(0, 4)))
  }, [])

  if (!isAuthenticated) {
    return (
      <div>
        Please <a href='/login'>login</a> to view products.
      </div>
    )
  }

  return (
    <div>
      <HeroCarousel />
      <div className='max-w-6xl mx-auto mt-10 items-center flex-1 flex-col'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Sản phẩm nổi bật</h2>
        <div className='grid grid-cols-100 md:grid-cols-500 lg:grid-cols-4 gap-20'>
          {featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              name={product['product-name']}
              price={product['product-price']}
              imageUrl={product['product-image']}
              description={''} // Nếu có trường mô tả thì truyền vào
              isNew={false} // Nếu có trường phân biệt sản phẩm mới thì truyền vào
              onAddToCart={(id) => {
                console.log(`Added product ${id} to cart`)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
