'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'

const categories = [
  { label: 'Tất cả', value: '' },
  {
    label: 'CD / DVD',
    value: '687a5c8eaea60fd849fc0847',
    subcategories: [
      { label: 'CD Nhạc Việt', value: 'cd-viet', filterKey: 'subcategory' },
      { label: 'CD Nhạc Âu Mỹ', value: 'cd-aumy', filterKey: 'subcategory' }
    ]
  },
  {
    label: 'Đĩa Than / Vinyl',
    value: '687a5c8eaea60fd849fc0848',
    subcategories: [
      { label: 'Vinyl Việt', value: 'vinyl-viet', filterKey: 'subcategory' },
      { label: 'Vinyl Âu Mỹ', value: 'vinyl-aumy', filterKey: 'subcategory' }
    ]
  },
  { label: 'Băng Cassette', value: '687a5c8eaea60fd849fc0849' },
  { label: 'Merch', value: '687a5c8eaea60fd849fc084a' }
]

function ProductCategoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selected = searchParams.get('category') || ''
  const selectedSubcategory = searchParams.get('subcategory') || ''
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const handleClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === selected) {
      params.delete('category')
      params.delete('subcategory') // Clear subcategory when unselecting category
    } else {
      params.set('category', value)
      params.delete('subcategory') // Clear subcategory when changing category
    }
    router.push(`/product?${params.toString()}`)
  }

  const handleSubcategoryClick = (categoryValue: string, subcategoryValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category', categoryValue)

    if (selectedSubcategory === subcategoryValue) {
      params.delete('subcategory')
    } else {
      params.set('subcategory', subcategoryValue)
    }

    router.push(`/product?${params.toString()}`)
  }

  const toggleExpanded = (categoryValue: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryValue) ? prev.filter((cat) => cat !== categoryValue) : [...prev, categoryValue]
    )
  }

  return (
    <aside className='w-full sm:w-64 mb-8 sm:mb-0 sm:pr-8'>
      <h2 className='text-3xl font-bold mb-4 border-b pb-2 border-gray-500 uppercase'>Danh mục sản phẩm</h2>
      <ul className='space-y-2'>
        {categories.map((cat) => (
          <li key={cat.value}>
            <div>
              <Button
                variant='ghost'
                className={cn(
                  'justify-between w-full hover:bg-muted rounded-none text-xl border-b',
                  selected === cat.value ? 'text-primary font-semibold' : 'text-gray-700'
                )}
                onClick={() => {
                  handleClick(cat.value)
                  if (cat.subcategories) {
                    toggleExpanded(cat.value)
                  }
                }}
              >
                <span>{cat.label}</span>
                {cat.subcategories &&
                  (expandedCategories.includes(cat.value) || selected === cat.value ? (
                    <ChevronDown className='h-4 w-4' />
                  ) : (
                    <ChevronRight className='h-4 w-4' />
                  ))}
              </Button>

              {/* Subcategories */}
              {cat.subcategories && (expandedCategories.includes(cat.value) || selected === cat.value) && (
                <ul className='ml-4 mt-2 space-y-1'>
                  {cat.subcategories.map((subcat) => (
                    <li key={subcat.value}>
                      <Button
                        variant='ghost'
                        className={cn(
                          'justify-start w-full hover:bg-muted rounded-none text-lg border-b border-gray-300',
                          selectedSubcategory === subcat.value && selected === cat.value
                            ? 'text-primary font-semibold bg-muted/50'
                            : 'text-gray-600'
                        )}
                        onClick={() => handleSubcategoryClick(cat.value, subcat.value)}
                      >
                        {subcat.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function ProductCategory() {
  return (
    <Suspense
      fallback={
        <aside className='w-full sm:w-64 mb-8 sm:mb-0 sm:pr-8'>
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
        </aside>
      }
    >
      <ProductCategoryContent />
    </Suspense>
  )
}
