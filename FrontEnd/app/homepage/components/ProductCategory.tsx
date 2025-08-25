'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'

const categories = [
  { label: 'ALL', value: '', image: '/images/all.png' },
  {
    label: 'CD / DVD',
    value: '687a5c8eaea60fd849fc0847',
    subcategories: [
      { label: 'Vietnam CD', value: 'cd-viet', filterKey: 'subcategory' },
      { label: 'US-UK CD', value: 'cd-aumy', filterKey: 'subcategory' }
    ],
    image: '/images/cd.jpg'
  },
  {
    label: 'VINYL',
    value: '687a5c8eaea60fd849fc0848',
    subcategories: [
      { label: 'Vietnam Vinyl', value: 'vinyl-viet', filterKey: 'subcategory' },
      { label: 'US-UK Vinyl', value: 'vinyl-aumy', filterKey: 'subcategory' }
    ],
    image: '/images/vinyl.png'
  },
  { label: 'CASSETTE', value: '687a5c8eaea60fd849fc0849', image: '/images/cassette.jpg' },
  { label: 'MERCH', value: '687a5c8eaea60fd849fc084a', image: '/images/merch.jpg' }
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
  const currentCategory = categories.find((cat) => cat.value === selected) || categories[0]

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
    <div className='w-full mb-8'>
      {/* Category Navigation */}
      <div className='flex justify-center items-center gap-10 h-14 border-b border-gray-300 font-[DrukWideBold]'>
        {categories.map((cat) => (
          <div key={cat.value} className='relative'>
            <Button
              variant='ghost'
              className={cn(
                'justify-between hover:bg-muted rounded-none text-2xl sm:text-3xl font-bold uppercase transition-colors px-4 py-2',
                selected === cat.value ? 'text-[#BB3C36]' : 'text-neutral-800 hover:text-red-500'
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
                  <ChevronDown className='h-4 w-4 ml-2' />
                ) : (
                  <ChevronRight className='h-4 w-4 ml-2' />
                ))}
            </Button>
          </div>
        ))}
      </div>

      {/* Subcategories Section - Appears below main nav */}
      {categories.some(
        (cat) => cat.subcategories && (expandedCategories.includes(cat.value) || selected === cat.value)
      ) && (
        <div className='bg-gray-50 border-b border-gray-300 py-4'>
          <div className='flex justify-center items-center gap-8 flex-wrap'>
            {categories.map(
              (cat) =>
                cat.subcategories &&
                (expandedCategories.includes(cat.value) || selected === cat.value) && (
                  <div key={cat.value} className='flex gap-4'>
                    {cat.subcategories.map((subcat) => (
                      <Button
                        key={subcat.value}
                        variant='ghost'
                        className={cn(
                          'px-4 py-2 rounded-md text-base font-medium transition-colors',
                          selectedSubcategory === subcat.value && selected === cat.value
                            ? 'bg-[#BB3C36] text-white hover:bg-[#A0342E]'
                            : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                        )}
                        onClick={() => handleSubcategoryClick(cat.value, subcat.value)}
                      >
                        {subcat.label}
                      </Button>
                    ))}
                  </div>
                )
            )}
          </div>
        </div>
      )}

      {/* Category Image */}
      <img src={currentCategory.image} alt={currentCategory.label} className='w-full h-64 object-cover mt-6' />
    </div>
  )
}

export default function ProductCategory() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <ProductCategoryContent />
    </Suspense>
  )
}
