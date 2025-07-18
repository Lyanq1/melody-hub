// ProductCategory.tsx

'use client'

import { useEffect, useState } from 'react'

type Category = {
  _id: string
  name: string
}

export default function ProductCategory() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    }

    fetchCategories()
  }, [])

  return (
    <div className='p-4'>
      <h3 className='text-lg font-semibold mb-2'>DANH MỤC SẢN PHẨM</h3>
      <ul className='space-y-2'>
        {categories.map((cat) => (
          <li key={cat._id} className='text-gray-800 hover:underline cursor-pointer'>
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
