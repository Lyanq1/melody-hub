'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Pencil, Trash2 } from "lucide-react"
import axios from "axios"

type Product = {
  _id: string
  name: string
  category: string
  image: string
  stock: number
  color: string
  price: number
  rating: string
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/product").then(res => setProducts(res.data))
  }, [])

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold border-b-4 border-red-500">PRODUCTS</h1>
        <Button>Add Product</Button>
      </div>

      {/* Filter + Search + Actions */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <Input
          placeholder="Search..."
          className="w-72"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="outline"><Pencil className="w-4 h-4 mr-1"/> Edit</Button>
          <Button variant="destructive"><Trash2 className="w-4 h-4 mr-1"/> Delete</Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Checkbox /></TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map(p => (
            <TableRow key={p._id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(p._id)}
                  onCheckedChange={() => toggleSelect(p._id)}
                />
              </TableCell>
              <TableCell className="flex items-center gap-3">
                <Image src={p.image} alt={p.name} width={60} height={60} className="rounded-md object-cover"/>
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-gray-500 text-sm">{p.category}</div>
                </div>
              </TableCell>
              <TableCell>{p.stock} in stock</TableCell>
              <TableCell>{p.color}</TableCell>
              <TableCell>${p.price}</TableCell>
              <TableCell>{p.rating}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination className="justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))}/>
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))}/>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
