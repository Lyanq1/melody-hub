'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const categories = [
  { label: 'ALL', value: '', image: 'http://localhost:3000/images/all.png' },

  { label: 'CD / DVD', value: '687a5c8eaea60fd849fc0847', image: 'http://localhost:3000/images/vinyl.png' },
  { label: 'VINYL', value: '687a5c8eaea60fd849fc0848', image: 'http://localhost:3000/images/vinyl.png' },
  { label: 'CASSETTE', value: '687a5c8eaea60fd849fc0849', image: 'http://localhost:3000/images/vinyl.png' },
  { label: 'MERCH', value: '687a5c8eaea60fd849fc084a', image: 'http://localhost:3000/images/vinyl.png' }
]

function ProductCategoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selected = searchParams.get('category') || ''

  const handleClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === selected) {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    router.push(`/product?${params.toString()}`)
  }

  const currentCategory = categories.find(cat => cat.value === selected) || categories[0]

  return (
    <div className="w-full mb-8">
      <div className="flex justify-center items-center gap-20 h-14 border-b border-gray-300 font-[DrukWideBold]">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleClick(cat.value)}
            className={cn(
              "text-2xl sm:text-3xl font-bold uppercase transition-colors",
              selected === cat.value
                ? "text-[#BB3C36]"
                : "text-neutral-800 hover:text-red-500"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* banner thay đổi theo category */}
      <img
        src={currentCategory.image}
        alt={currentCategory.label}
        className="w-full h-64 object-cover mt-6"
      />
    </div>
  )
}

export default function ProductCategory() {
  return (
    <Suspense
      fallback={
        <div className="w-full mb-8">
          {/* thanh bar ngang skeleton */}
          <div className="flex justify-center items-center gap-20 h-14 border-b border-gray-300 animate-pulse">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-24 bg-gray-200 rounded"
                ></div>
              ))}
          </div>

          {/* banner skeleton */}
          <div className="w-full h-64 bg-gray-200 mt-6 animate-pulse"></div>
        </div>
      }
    >
      <ProductCategoryContent />
    </Suspense>
  )
}