'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'
import { Search } from 'lucide-react'

type Product = {
  _id: string
  name: string
  price: string
  image: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Click outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/product')
        const filtered = res.data.filter((product: Product) =>
          product.name?.toLowerCase().includes(query.toLowerCase())
        )
        setSuggestions(filtered.slice(0, 20))
        setShowSuggestions(true)
      } catch (err) {
        console.error('Error fetching suggestions:', err)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/product?search=${encodeURIComponent(query)}`)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (product: Product) => {
    router.push(`/product/${product._id}`)
    setQuery(product.name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div ref={wrapperRef} className='w-full sm:w-[400px] lg:w-[512px] h-12 relative max-w-lg'>
      <form onSubmit={handleSearch} className='relative flex w-full h-12 rounded-[30px] bg-white overflow-hidden'>
        {/* Input */}
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder='Search...'
          className="flex-1 px-3 sm:px-4 text-black text-sm sm:text-lg font-['Inter_Tight'] placeholder-stone-400 focus:outline-none"
        />

        {/* Search button */}
        <button
          type='submit'
          className="flex items-center justify-center gap-1 sm:gap-2 min-w-[60px] sm:w-auto h-full bg-[#DDB351] rounded-tr-[30px] rounded-br-[30px] px-3 sm:px-4 text-white text-sm sm:text-lg font-semibold font-['Inter_Tight']"
        >
          <Search className='w-4 h-4 sm:w-5 sm:h-5' />
          <span className='hidden sm:inline'>Search</span>
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className='absolute w-full mt-2 bg-[#1f1e1d] rounded-md shadow-lg max-h-72 overflow-y-auto'>
          {suggestions.map((item) => (
            <li
              key={item._id}
              onClick={() => handleSuggestionClick(item)}
              className='flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#3d3b3a] cursor-pointer transition duration-150'
            >
              <Image src={item.image} alt={item.name} width={48} height={48} className='rounded-lg' />
              <div className='flex flex-col text-left'>
                <p className='font-medium text-left'>{item.name}</p>
                <p className='font-light text-gray-300 text-left'>{item.price}₫</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
