import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { toast } from 'sonner'

interface ProductCardProps {
  id: string
  name: string
  price: string
  imageUrl: string
  isNew?: boolean
  onAddToCart?: (id: string) => void
}

const addToLocalStorage = (id: string, name: string, price: string, imageUrl: string) => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  if (!cart.some((item: { id: string }) => item.id === id)) {
    cart.push({ id, name, price, imageUrl, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  // Gửi sự kiện ra toàn window để Navbar biết
  window.dispatchEvent(new Event('cart-updated'))

  toast.success('Product added to cart', {
    description: `"${name}" has been added successfully.`,
    duration: 2500
  })
}

const addToWishlist = (id: string, name: string, price: string, imageUrl: string) => {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')

  if (!wishlist.some((item: { id: string }) => item.id === id)) {
    wishlist.push({ id, name, price, imageUrl })
    localStorage.setItem('wishlist', JSON.stringify(wishlist))

    toast.success('Product added to wishlist', {
      description: `"${name}" has been added successfully.`,
      duration: 2500
    })
  } else {
    toast.info('Product already in wishlist', {
      description: `"${name}" is already saved.`,
      duration: 2000
    })
  }
}

export function ProductCard({ id, name, price, imageUrl, isNew = false, onAddToCart }: ProductCardProps) {
  return (
    <Card className='w-full overflow-hidden flex flex-col h-full group font-[Ceflinty]'>
      <div className='relative h-[250px] w-full'>
        <Image src={imageUrl} alt={name} fill className='object-cover' sizes='(max-width: 300px) 100vw, 300px' />
        {isNew && (
          <span className='absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium'>
            New
          </span>
        )}
        <div className='hidden group-hover:block absolute bottom-0 left-0 w-full bg-gray-800 bg-opacity-75 text-white py-2 text-center transition-all duration-300'>
          <button
            onClick={() => addToWishlist(id, name, price, imageUrl)}
            className='text-xl focus:outline-none relative group/button'
            aria-label='Add to wishlist'
          >
            <HeartIconOutline className='w-6 h-6 text-white absolute inset-0 group-hover/button:opacity-0 transition-opacity duration-200' />
            <HeartIconSolid className='w-6 h-6 text-white opacity-0 group-hover/button:opacity-100 transition-opacity duration-200' />
          </button>
        </div>
      </div>

      <div className='flex-1 flex flex-col'>
        <CardHeader>
          <CardTitle className='text-lg'>{name}</CardTitle>
        </CardHeader>
      </div>

      <div className='flex flex-col items-center'>
        <CardDescription className='text-lg font-semibold text-primary pt-0'>{price}</CardDescription>
      </div>

      <CardFooter>
        <Button
          className='w-full'
          onClick={() => {
            onAddToCart?.(id)
            addToLocalStorage(id, name, price, imageUrl)
          }}
        >
          ADD TO CART
        </Button>
      </CardFooter>
    </Card>
  )
} 