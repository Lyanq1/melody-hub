'use client'
import { ProductCard } from '@/components/ui/product-card'
import { useEffect, useState } from 'react'

export default function Products() {
  type Product = {
    _id: string
    ['product-name']: string
    ['product-price']: string
    ['product-image']: string
    // Add more fields if needed
  }
  
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('http://localhost:5000/api/products') 
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="grid grid-cols-20 md:grid-cols-50 lg:grid-cols-4 gap-4">
      {products.map((product) => (
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
  )
}