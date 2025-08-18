/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useEffect, useState } from 'react'
import { ProductCard } from './components/ProductCard'
import Carousel from './components/Carousel'
import axios from 'axios'


export default function Homepage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
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
        //         const response = await axios.get('https://melody-hub-vhml.onrender.com/api/products')

        const response = await axios.get('http://localhost:5000/api/product')
        setFeaturedProducts(response.data.slice(0, 12))
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
      <div className='max-w-6xl mx-auto mt-10 items-center flex-1 flex-col'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Sản phẩm nổi bật</h2>
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
      </div>
    </div>
  )
}
