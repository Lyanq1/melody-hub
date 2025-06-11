'use client'
import { ProductCard } from '@/components/ui/product-card'

const sampleProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 199.99,
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    isNew: true,
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 299.99,
    description: 'Feature-rich smartwatch with health tracking and notifications.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    isNew: false,
  },
  {
    id: '3',
    name: 'Laptop Stand',
    price: 49.99,
    description: 'Ergonomic aluminum laptop stand for better posture and cooling.',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
    isNew: true,
  },
]

export default function Products() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onAddToCart={(id) => {
              console.log(`Added product ${id} to cart`)
            }}
          />
        ))}
      </div>
    </div>
  )
}