'use client'
import Ecatalog from '@/components/ECatalog'
import { ProductCard } from '@/components/ui/product-card'
import { useEffect, useState,  Suspense} from 'react'
import ProductCategory from '../homepage/components/ProductCategory'
import { useSearchParams } from 'next/navigation'
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
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
import axios from 'axios'

function ProductsContent() {
  type Product = {
    _id: string
    name: string
    price: string
    image: string
    categoryId: string
    // Add more fields if needed
  }

  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 16

  // elastic search dựa vào tên sản phẩm lấy từ thanh tìm k

  // bộ lọc sidebar
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category')
  const filterByCategory = (product: Product) => {
    if (!selectedCategory) return true
    return product.categoryId === selectedCategory
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // const response = await axios.get('https://melody-hub-vhml.onrender.com/api/products')
        const response = await axios.get('http://localhost:5000/api/product')

        setProducts(response.data)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [])

  // PHẦN PHÂN TRANG
  // Tính tổng số trang
  // const totalPages = Math.ceil(products.length / itemsPerPage)
  const [inputPage, setInputPage] = useState(currentPage)

  // Lấy danh sách sản phẩm cho trang hiện tại
  const filteredProducts = products.filter(filterByCategory)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setInputPage(page) // đồng bộ input
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

  const [sortOption, setSortOption] = useState("price-desc")
  const [genre, setGenre] = useState("all")

  return (
    <div>
      <div className='container mx-auto py-8'>
        <ProductCategory />
        
        <div className="w-full mt-10 flex justify-between items-end">
          {/* SHOP label + line */}
          <div className="flex flex-col items-start">
            <h2 className="text-5xl font-bold font-[DrukWideBold] text-neutral-800">SHOP</h2>
            <div className="w-52 h-2 bg-[#BB3C36] mt-2"></div>
          </div>

          {/* SORT BY + dropdowns */}
          <div className="flex items-center gap-6">
            <span className="text-xl font-semibold text-black font-['InterTight']">SORT BY:</span>

            <div className="flex gap-4">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1 text-neutral-600 text-xl font-semibold font-['InterTight'] focus:outline-none">
                    {sortOption === "price-desc" && "PRICE, DESCENDING"}
                    {sortOption === "price-asc" && "PRICE, ASCENDING"}
                    {sortOption === "name-asc" && "NAME, A → Z"}
                    {sortOption === "name-desc" && "NAME, Z → A"}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56"
                >
                  <DropdownMenuItem
                    onClick={() => setSortOption("price-desc")}
                    className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    PRICE, DESCENDING
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption("price-asc")}
                    className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    PRICE, ASCENDING
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption("name-asc")}
                    className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    NAME, A → Z
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption("name-desc")}
                    className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    NAME, Z → A
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1 text-neutral-600 text-xl font-semibold font-['InterTight'] focus:outline-none">
                    {genre === "all" && "ALL GENRES"}
                    {genre === "classical" && "CLASSICAL"}
                    {genre === "jazz" && "JAZZ"}
                    {genre === "rock" && "ROCK"}
                    {genre === "pop" && "POP"}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56"
                >
                  <DropdownMenuItem
                    onClick={() => setGenre("all")}
                    className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    ALL GENRES
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setGenre("classical")}
                    className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    CLASSICAL
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setGenre("jazz")}
                    className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    JAZZ
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setGenre("rock")}
                    className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    ROCK
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setGenre("pop")}
                    className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    POP
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-6 mt-10'>
          
          <div className='flex-1'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center'>
              {currentItems.map((product) => (
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

            {totalPages > 1 && (
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

                    {/* Ô nhập trang */}
                    <div className='flex items-center gap-2 ml-4'>
                      <span className='text-sm'>Go to</span>
                      <input
                        type='number'
                        min={1}
                        max={totalPages}
                        value={inputPage}
                        onChange={(e) => setInputPage(Number(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && inputPage >= 1 && inputPage <= totalPages) {
                            handlePageChange(inputPage)
                          }
                        }}
                        className='w-16 px-2 py-1 border rounded text-sm text-center'
                      />
                      <span className='text-sm'>/ {totalPages}</span>
                    </div>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  return (
    <Suspense fallback={
      <div className='container mx-auto py-8'>
        <div className='flex flex-col sm:flex-row gap-6'>
          <div className='w-full sm:w-64 mb-8 sm:mb-0 sm:pr-8'>
            <div className='animate-pulse'>
              <div className='h-8 bg-gray-200 rounded mb-4'></div>
              <div className='space-y-2'>
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className='h-6 bg-gray-200 rounded'></div>
                ))}
              </div>
            </div>
          </div>
          <div className='flex-1'>
            <div className='animate-pulse'>
              <div className='h-10 bg-gray-200 rounded mb-8'></div>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {Array(16).fill(0).map((_, i) => (
                  <div key={i} className='aspect-[3/4] bg-gray-200 rounded'></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}