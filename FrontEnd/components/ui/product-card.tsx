'use client'

import Image from 'next/image'
import { Button } from './button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ProductCardProps {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string
  isNew?: boolean
  onAddToCart?: (id: string) => void
}

export function ProductCard({
  id,
  name,
  price,
  description,
  imageUrl,
  isNew = false,
  onAddToCart,
}: ProductCardProps) {
  return (
    <Card className="w-[300px] overflow-hidden">
      <div className="relative h-[200px] w-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 300px) 100vw, 300px"
        />
        {isNew && (
          <span className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium">
            New
          </span>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription className="text-lg font-semibold text-primary">
          ${price.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onAddToCart?.(id)}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
} 