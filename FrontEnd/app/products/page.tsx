'use client'
import Ecatalog from '@/components/ECatalog'
import { ProductCard } from '@/components/ui/product-card'
import { useEffect, useState } from 'react'

// Import các component Pagination từ Shadcn UI
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination' // Điều chỉnh đường dẫn import nếu cần thiết

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
  const currentItems = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Hàm xử lý khi chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Tùy chọn: Cuộn lên đầu trang sau khi chuyển trang để cải thiện UX
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Hàm để tạo các số trang hiển thị (có thể có dấu "...")
  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const pageNumbers = []
    const maxPageButtons = 5 // Số lượng nút trang tối đa muốn hiển thị

    if (totalPages <= maxPageButtons) {
      // Nếu tổng số trang ít, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      pageNumbers.push(1)

      // Xác định phạm vi các trang ở giữa để hiển thị
      let startPage = Math.max(2, currentPage - Math.floor(maxPageButtons / 2) + 1)
      let endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPageButtons / 2) - 1)

      // Điều chỉnh start/end nếu gần biên
      if (currentPage < maxPageButtons - 1) {
        endPage = maxPageButtons - 1
      }
      if (currentPage > totalPages - (maxPageButtons - 2)) {
        startPage = totalPages - (maxPageButtons - 2)
      }

      if (startPage > 2) {
        pageNumbers.push('...') // Dấu chấm lửng ở đầu
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...') // Dấu chấm lửng ở cuối
      }

      // Luôn hiển thị trang cuối cùng nếu chưa bao gồm
      if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages)
      }
    }
    return pageNumbers
  }

  return (
    <div>
      <Ecatalog />
      <div className='container mx-auto py-8'>
        {' '}
        {/* Thêm container và mx-auto để căn giữa nội dung */}
        <h1
          style={{ fontFamily: 'MicaValo', fontSize: '40px' }}
          className='text-3xl font-bold mb-8 text-left'
        >
          OUR PRODUCTS
        </h1>
        <div
          style={{ fontFamily: 'Ceflinty' }}
          className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center'
        >
          {currentItems.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              name={product['product-name']}
              price={product['product-price']}
              imageUrl={product['product-image']}
              isNew={false} // Nếu có trường phân biệt sản phẩm mới thì truyền vào
              onAddToCart={(id) => {
                console.log(`Added product ${id} to cart`)
              }}
            />
          ))}
        </div>
        {/* Shadcn UI Pagination */}
        {totalPages > 1 && ( // Chỉ hiển thị phân trang nếu có nhiều hơn 1 trang
          <div className='flex justify-center mt-8'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    isActive={currentPage > 1}
                    className='cursor-pointer'
                  />
                </PaginationItem>

                {/* Hiển thị các số trang và dấu "..." */}
                {getPageNumbers(currentPage, totalPages).map((page, index) => (
                  <PaginationItem key={index}>
                    {page === '...' ? (
                      <PaginationEllipsis className='cursor-default' />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(page as number)}
                        isActive={page === currentPage}
                        className='cursor-pointer'
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    isActive={currentPage < totalPages}
                    className='cursor-pointer'
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}

