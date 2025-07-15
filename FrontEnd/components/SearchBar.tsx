'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
type Product = {
  _id: string
  name: string
  price: string
  image: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get('https://melody-hub-vhml.onrender.com/api/products')
        const filtered = res.data.filter((product: Product) =>
          product.name?.toLowerCase().includes(query.toLowerCase())
        )
        setSuggestions(filtered.slice(0, 10))
      } catch (err) {
        console.error('Error fetching suggestions:', err)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`)
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (name: string) => {
    router.push(`/products?search=${encodeURIComponent(name)}`)
    setQuery('')
    setSuggestions([])
  }

  return (
    <div className='relative max-w-xl min-w-lg'>
      <form onSubmit={handleSearch}>
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Tìm sản phẩm...'
          className='w-full px-4 py-2 text-white bg-[#323031] border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200'
        />
      </form>

      {suggestions.length > 0 && (
        <ul className='absolute z-50 w-full mt-1 bg-[#1f1e1d] border border-gray-600 rounded-md shadow-lg max-h-72 overflow-y-auto'>
          {suggestions.map((item) => (
            <li
              key={item._id}
              onClick={() => handleSuggestionClick(item.name)}
              className='flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#3d3b3a] cursor-pointer transition duration-150'
            >
              <img src={item.image} alt={item.name} className='w-12 h-12 rounded-lg' />
              <div>
                <p className='font-medium'>{item.name}</p>
                <p className='text-xs text-gray-400'>{item.price}₫</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
