'use client'

import Image from 'next/image'
import { Button } from './button'
import {
  Card,
  // CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

interface ProductCardProps {
  id: string
  name: string
  price: string
  description: string
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
}

export function ProductCard({
  id,
  name,
  price,
  // description,
  imageUrl,
  isNew = false,
  onAddToCart
}: ProductCardProps) {
  return (
    <Card className='w-[300px] overflow-hidden flex-1 flex flex-col '>
      <div className='relative h-[300px] w-full '>
        <Image src={imageUrl} alt={name} fill className='object-cover' sizes='(max-width: 300px) 100vw, 300px' />
        {isNew && (
          <span className='absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium'>
            New
          </span>
        )}
      </div>
      <div className='flex-1 flex flex-col'>
        <CardHeader>
          <CardTitle className='text-lg'>{name}</CardTitle>
        </CardHeader>
        {/* <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent> */}
        
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
