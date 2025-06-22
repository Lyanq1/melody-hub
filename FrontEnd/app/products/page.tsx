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
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 16

  useEffect(() => {
    fetch('https://melody-hub-vhml.onrender.com/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
  }, [])

  // Tính tổng số trang
  const totalPages = Math.ceil(products.length / itemsPerPage)

  // Lấy danh sách sản phẩm cho trang hiện tại
  const currentItems = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className='py-8'>
      <h1 style={{ fontFamily: 'MicaValo', fontSize: '40px', color: '#323031' }} className='text-3xl font-bold mb-8'>
        our products
      </h1>
      <div style={{ fontFamily: 'Ceflinty' }} className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center'>
        {currentItems.map((product) => (
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
      <div className='flex justify-center mt-8'>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className='px-4 py-2 bg-gray-300 rounded-l'
        >
          Previous
        </button>
        <span className='px-4 py-2 bg-gray-200'>{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className='px-4 py-2 bg-gray-300 rounded-r'
        >
          Next
        </button>
      </div>
    </div>
  )
}
