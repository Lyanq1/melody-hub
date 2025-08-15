'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const categories = [
  { label: 'Tất cả', value: '' },

  { label: 'CD / DVD', value: '687a5c8eaea60fd849fc0847' },
  { label: 'Đĩa Than / Vinyl', value: '687a5c8eaea60fd849fc0848' },
  { label: 'Băng Cassette', value: '687a5c8eaea60fd849fc0849' },
  { label: 'Merch', value: '687a5c8eaea60fd849fc084a' }
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

  return (
    <aside className='w-full sm:w-64 mb-8 sm:mb-0 sm:pr-8'>
      <h2 className='text-3xl font-bold mb-4 border-b pb-2 border-gray-500 uppercase'>Danh mục sản phẩm</h2>
      <ul className='space-y-2'>
        {categories.map((cat) => (
          <li key={cat.value}>
            <Button
              variant='ghost'
              className={cn(
                'justify-start w-full hover:bg-muted rounded-none text-xl border-b',
                selected === cat.value ? 'text-primary font-semibold' : 'text-gray-700'
              )}
              onClick={() => handleClick(cat.value)}
            >
              {cat.label}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function ProductCategory() {
  return (
    <Suspense fallback={
      <aside className='w-full sm:w-64 mb-8 sm:mb-0 sm:pr-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded mb-4'></div>
          <div className='space-y-2'>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className='h-6 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </aside>
    }>
      <ProductCategoryContent />
    </Suspense>
  )
}