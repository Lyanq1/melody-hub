'use client'
import Ecatalog from '@/components/ECatalog'
import { ProductCard } from '@/components/ui/product-card'
import { useEffect, useState, Suspense, useMemo, useCallback } from 'react'
import ProductCategory from '../homepage/components/ProductCategory'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
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
    country?: string
    iso2?: string
    // Add more fields if needed
  }

  type SortOption = {
    label: string
    value: string
  }

  const sortOptions: SortOption[] = [
    { label: 'Mặc định', value: '' },
    { label: 'Giá: Cao đến thấp', value: 'price-desc' },
    { label: 'Giá: Thấp đến cao', value: 'price-asc' },
    { label: 'Tên: A đến Z', value: 'name-asc' },
    { label: 'Tên: Z đến A', value: 'name-desc' }
  ]

  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const itemsPerPage = 16

  // elastic search dựa vào tên sản phẩm lấy từ thanh tìm k

  // URL parameters
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category')
  const selectedSubcategory = searchParams.get('subcategory')
  const selectedSort = searchParams.get('sort') || ''

  const filterByCategory = useCallback(
    (product: Product) => {
      // If no category selected, show all products
      if (!selectedCategory) return true

      // First check if product matches the selected category
      if (product.categoryId !== selectedCategory) return false

      // If no subcategory selected, show all products in the category
      if (!selectedSubcategory) return true

      // Apply subcategory filtering based on country and product name
      const isVietnamese = product.country === 'Vietnam' || product.iso2 === 'VN'
      const productName = product.name?.toLowerCase() || ''

      switch (selectedSubcategory) {
        case 'cd-viet':
          return (productName.includes('đĩa cd') || productName.includes('cd')) && isVietnamese
        case 'cd-aumy':
          return (productName.includes('đĩa cd') || productName.includes('cd')) && !isVietnamese
        case 'vinyl-viet':
          return (productName.includes('đĩa than') || productName.includes('vinyl')) && isVietnamese
        case 'vinyl-aumy':
          return (productName.includes('đĩa than') || productName.includes('vinyl')) && !isVietnamese
        default:
          return true
      }
    },
    [selectedCategory, selectedSubcategory]
  )

  // Hàm sắp xếp sản phẩm với error handling
  const sortProducts = useCallback((products: Product[], sortType: string): Product[] => {
    if (!sortType || !products || products.length === 0) return products

    try {
      return [...products].sort((a, b) => {
        // Safety checks
        if (!a || !b) return 0

        switch (sortType) {
          case 'price-asc': {
            // Safe price parsing với fallback
            const priceA = a.price ? parseFloat(String(a.price).replace(/[^\d.-]/g, '')) : 0
            const priceB = b.price ? parseFloat(String(b.price).replace(/[^\d.-]/g, '')) : 0

            // Handle NaN cases
            if (isNaN(priceA) && isNaN(priceB)) return 0
            if (isNaN(priceA)) return 1
            if (isNaN(priceB)) return -1

            return priceA - priceB
          }
          case 'price-desc': {
            const priceA = a.price ? parseFloat(String(a.price).replace(/[^\d.-]/g, '')) : 0
            const priceB = b.price ? parseFloat(String(b.price).replace(/[^\d.-]/g, '')) : 0

            if (isNaN(priceA) && isNaN(priceB)) return 0
            if (isNaN(priceA)) return 1
            if (isNaN(priceB)) return -1

            return priceB - priceA
          }
          case 'name-asc': {
            const nameA = a.name ? String(a.name).trim() : ''
            const nameB = b.name ? String(b.name).trim() : ''

            if (!nameA && !nameB) return 0
            if (!nameA) return 1
            if (!nameB) return -1

            return nameA.localeCompare(nameB, 'vi', {
              sensitivity: 'base',
              numeric: true,
              ignorePunctuation: true
            })
          }
          case 'name-desc': {
            const nameA = a.name ? String(a.name).trim() : ''
            const nameB = b.name ? String(b.name).trim() : ''

            if (!nameA && !nameB) return 0
            if (!nameA) return 1
            if (!nameB) return -1

            return nameB.localeCompare(nameA, 'vi', {
              sensitivity: 'base',
              numeric: true,
              ignorePunctuation: true
            })
          }
          default:
            return 0
        }
      })
    } catch (error) {
      console.warn('Sort error:', error)
      return products // Return original array if sort fails
    }
  }, [])

  // Handler cho sort dropdown với debouncing
  const handleSortChange = useCallback(
    (sortValue: string) => {
      try {
        const params = new URLSearchParams(searchParams.toString())
        if (sortValue && sortValue !== selectedSort) {
          params.set('sort', sortValue)
        } else if (!sortValue) {
          params.delete('sort')
        } else {
          return // Same value, no change needed
        }

        // Reset về trang đầu khi sort
        setCurrentPage(1)

        // Brief loading state to prevent rapid clicks
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 100)

        router.push(`/product?${params.toString()}`)
      } catch (error) {
        console.warn('Sort change error:', error)
        setIsLoading(false)
      }
    },
    [searchParams, selectedSort, router]
  )

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

  // Reset trang về 1 khi thay đổi category hoặc subcategory
  useEffect(() => {
    setCurrentPage(1)
    setInputPage(1)
  }, [selectedCategory, selectedSubcategory])

  // PHẦN PHÂN TRANG
  // Tính tổng số trang
  // const totalPages = Math.ceil(products.length / itemsPerPage)
  const [inputPage, setInputPage] = useState(currentPage)

  // Memoized filtering và sorting để tối ưu performance
  const filteredProducts = useMemo(() => {
    try {
      return products.filter(filterByCategory)
    } catch (error) {
      console.warn('Filter error:', error)
      return products
    }
  }, [products, filterByCategory])

  const sortedProducts = useMemo(() => {
    try {
      return sortProducts(filteredProducts, selectedSort)
    } catch (error) {
      console.warn('Sort products error:', error)
      return filteredProducts
    }
  }, [filteredProducts, selectedSort, sortProducts])

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  // Kiểm tra và adjust currentPage nếu vượt quá totalPages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
      setInputPage(totalPages)
    }
  }, [totalPages, currentPage])

  const currentItems = useMemo(() => {
    try {
      return sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    } catch (error) {
      console.warn('Pagination error:', error)
      return []
    }
  }, [sortedProducts, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    // Đảm bảo page trong khoảng hợp lệ
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
    setInputPage(validPage) // đồng bộ input
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
      <div className='container mx-auto py-8'>
        <h1 className='text-[40px] font-bold mb-8 text-left font-[MicaValo]'>OUR PRODUCTS</h1>

        <div className='flex flex-col sm:flex-row gap-6'>
          <ProductCategory />

          <div className='flex-1'>
            {/* Sort Filter */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='gap-2 w-full sm:w-auto' disabled={isLoading}>
                    <ArrowUpDown className='h-4 w-4' />
                    <span className='truncate'>
                      {isLoading
                        ? 'Đang sắp xếp...'
                        : sortOptions.find((option) => option.value === selectedSort)?.label || 'Sắp xếp'}
                    </span>
                    <ChevronDown className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={selectedSort === option.value ? 'bg-muted font-semibold' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {sortedProducts.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 text-center'>
                <div className='text-6xl mb-4'>😔</div>
                <h3 className='text-xl font-semibold mb-2'>Không tìm thấy sản phẩm</h3>
                <p className='text-gray-600'>Không có sản phẩm nào trong danh mục này. Hãy thử chọn danh mục khác.</p>
              </div>
            ) : (
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
            )}

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
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          // Chỉ cho phép nhập số trong khoảng hợp lệ
                          if (value >= 1 && value <= totalPages) {
                            setInputPage(value)
                          } else if (e.target.value === '') {
                            setInputPage(1) // Default to 1 when empty
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            // Đảm bảo inputPage trong khoảng hợp lệ trước khi navigate
                            const validPage = Math.max(1, Math.min(inputPage, totalPages))
                            handlePageChange(validPage)
                          }
                        }}
                        onBlur={() => {
                          // Auto-correct khi user click ra ngoài
                          const validPage = Math.max(1, Math.min(inputPage, totalPages))
                          setInputPage(validPage)
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
    <Suspense
      fallback={
        <div className='container mx-auto py-8'>
          <div className='flex flex-col sm:flex-row gap-6'>
            <div className='w-full sm:w-64 mb-8 sm:mb-0 sm:pr-8'>
              <div className='animate-pulse'>
                <div className='h-8 bg-gray-200 rounded mb-4'></div>
                <div className='space-y-2'>
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className='h-6 bg-gray-200 rounded'></div>
                    ))}
                </div>
              </div>
            </div>
            <div className='flex-1'>
              <div className='animate-pulse'>
                <div className='h-10 bg-gray-200 rounded mb-8'></div>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {Array(16)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className='aspect-[3/4] bg-gray-200 rounded'></div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
