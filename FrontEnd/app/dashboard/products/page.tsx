'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"
import { Pencil, Trash2, Plus, Search, ChevronDown, ArrowUpDown, Upload, X } from "lucide-react"
import { adminProductService } from "@/lib/services/admin-product"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type Product = {
  _id: string
  name: string
  categoryId?: {
    _id: string
    name: string
  }
  image: string
  stock: number
  color?: string
  price: string
  rating?: string
  artist: string
}

type SortOption = {
  label: string
  value: string
}

const sortOptions: SortOption[] = [
  { label: 'Mặc định', value: '' },
  { label: 'Giá: Cao đến thấp', value: 'price-desc' },
  { label: 'Giá: Thấp đến cao', value: 'price-asc' },
  { label: 'Tên: A đến Z', value: 'name-asc' },
  { label: 'Tên: Z đến A', value: 'name-desc' }
]

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [inputPage, setInputPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedSort, setSelectedSort] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minStock, setMinStock] = useState('')
  const [maxStock, setMaxStock] = useState('')
  const perPage = 10
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [form, setForm] = useState({
    name: "",
    price: "",
    artist: "",
    stock: 0,
    image: "", // can be URL or data URL (base64)
    category: "",
    description: ""
  })
  const [imagePreview, setImagePreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await adminProductService.getAllProducts({
        page: 1,
        limit: 1000
      })
      setProducts(response.products)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await adminProductService.getAllCategories({
        page: 1,
        limit: 1000
      })
      setCategories(response.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setPage(1)
    setInputPage(1)
  }, [search, selectedSort, selectedCategory, minPrice, maxPrice, minStock, maxStock])

  // Keep inputPage in sync with page changes
  useEffect(() => {
    setInputPage(page)
  }, [page])

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(sortedProducts.length / perPage) || 1
    const valid = Math.max(1, Math.min(newPage, totalPages))
    setPage(valid)
    setInputPage(valid)
  }

  // Filter by search (port from customer page)
  const filterBySearch = useCallback((product: Product) => {
    if (!search.trim()) return true
    const productName = product.name?.toLowerCase() || ''
    const query = search.toLowerCase().trim()
    return productName.includes(query)
  }, [search])

  // Filter by category
  const filterByCategory = useCallback((product: Product) => {
    if (!selectedCategory) return true
    return product.categoryId?._id === selectedCategory
  }, [selectedCategory])

  // Filter by price range
  const filterByPrice = useCallback((product: Product) => {
    if (!minPrice && !maxPrice) return true
    const price = parseFloat(String(product.price).replace(/[^\d.-]/g, '')) || 0
    if (minPrice && price < parseFloat(minPrice)) return false
    if (maxPrice && price > parseFloat(maxPrice)) return false
    return true
  }, [minPrice, maxPrice])

  // Filter by stock range
  const filterByStock = useCallback((product: Product) => {
    if (!minStock && !maxStock) return true
    const stock = product.stock || 0
    if (minStock && stock < parseInt(minStock)) return false
    if (maxStock && stock > parseInt(maxStock)) return false
    return true
  }, [minStock, maxStock])

  const combineFilters = useCallback((product: Product) => {
    return filterBySearch(product) && 
           filterByCategory(product) && 
           filterByPrice(product) && 
           filterByStock(product)
  }, [filterBySearch, filterByCategory, filterByPrice, filterByStock])

  // Sort function (port from customer page)
  const sortProducts = useCallback((list: Product[], sortType: string): Product[] => {
    if (!sortType || !list || list.length === 0) return list
    try {
      return [...list].sort((a, b) => {
        if (!a || !b) return 0
        switch (sortType) {
          case 'price-asc': {
            const priceA = a.price ? parseFloat(String(a.price).replace(/[^\d.-]/g, '')) : 0
            const priceB = b.price ? parseFloat(String(b.price).replace(/[^\d.-]/g, '')) : 0
            if (isNaN(priceA) && isNaN(priceB)) return 0
            if (isNaN(priceA)) return 1
            if (isNaN(priceB)) return -1
            return priceA - priceB
          }
          case 'price-desc': {
            const priceA = a.price ? parseFloat(String(a.price).replace(/[^\d.-]/g, '')) : 0
            const priceB = b.price ? parseFloat(String(b.price).replace(/[^\d.-]/g, '')) : 0
            if (isNaN(priceA) && isNaN(priceB)) return 0
            if (isNaN(priceA)) return 1
            if (isNaN(priceB)) return -1
            return priceB - priceA
          }
          case 'name-asc': {
            const nameA = a.name ? String(a.name).trim() : ''
            const nameB = b.name ? String(b.name).trim() : ''
            if (!nameA && !nameB) return 0
            if (!nameA) return 1
            if (!nameB) return -1
            return nameA.localeCompare(nameB, 'vi', { sensitivity: 'base', numeric: true, ignorePunctuation: true })
          }
          case 'name-desc': {
            const nameA = a.name ? String(a.name).trim() : ''
            const nameB = b.name ? String(b.name).trim() : ''
            if (!nameA && !nameB) return 0
            if (!nameA) return 1
            if (!nameB) return -1
            return nameB.localeCompare(nameA, 'vi', { sensitivity: 'base', numeric: true, ignorePunctuation: true })
          }
          default:
            return 0
        }
      })
    } catch (error) {
      console.warn('Sort error:', error)
      return list
    }
  }, [])

  const filteredProducts = useMemo(() => {
    try {
      return products.filter(combineFilters)
    } catch (error) {
      console.warn('Filter error:', error)
      return products
    }
  }, [products, combineFilters])

  const sortedProducts = useMemo(() => {
    try {
      return sortProducts(filteredProducts, selectedSort)
    } catch (error) {
      console.warn('Sort products error:', error)
      return filteredProducts
    }
  }, [filteredProducts, selectedSort, sortProducts])

  const totalPages = Math.ceil(sortedProducts.length / perPage) || 1

  // Ensure current page stays within bounds when totalPages changes
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
      setInputPage(totalPages)
    }
  }, [totalPages, page])

  const currentItems = useMemo(() => {
    try {
      return sortedProducts.slice((page - 1) * perPage, page * perPage)
    } catch {
      return []
    }
  }, [sortedProducts, page, perPage])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await adminProductService.deleteProduct(productId)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name || "",
      price: product.price || "",
      artist: product.artist || "",
      stock: product.stock || 0,
      image: product.image || "",
      category: product.categoryId?._id || "",
      description: "" // Not supported by backend yet
    })
    setImagePreview("")
    setIsEditOpen(true)
  }

  const handleUpdateProduct = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!editingProduct || !form.name.trim() || !form.price.trim() || !form.artist.trim()) {
      toast.error('Please fill in name, price and artist')
      return
    }
    try {
      setUpdating(true)
      await adminProductService.updateProduct(editingProduct._id, {
        name: form.name.trim(),
        price: form.price.trim(),
        artist: form.artist.trim(),
        stock: Number(form.stock) || 0,
        image: form.image.trim() || undefined,
        categoryId: form.category || undefined
      })
      toast.success('Product updated successfully')
      setIsEditOpen(false)
      setEditingProduct(null)
      setForm({ name: "", price: "", artist: "", stock: 0, image: "", category: "", description: "" })
      setImagePreview("")
      await fetchProducts()
    } catch (error) {
      console.error('Update product error:', error)
      toast.error('Failed to update product')
    } finally {
      setUpdating(false)
    }
  }

  const clearAllFilters = () => {
    setSearch("")
    setSelectedCategory("")
    setMinPrice("")
    setMaxPrice("")
    setMinStock("")
    setMaxStock("")
    setSelectedSort("")
    setPage(1)
    setInputPage(1)
  }

  const handleDeleteMultiple = async () => {
    if (selected.length === 0) {
      toast.error('Please select products to delete')
      return
    }
    
    if (!confirm(`Are you sure you want to delete ${selected.length} products?`)) return
    
    try {
      await adminProductService.deleteMultipleProducts(selected)
      toast.success(`${selected.length} products deleted successfully`)
      setSelected([])
      fetchProducts()
    } catch (error) {
      console.error('Error deleting products:', error)
      toast.error('Failed to delete products')
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === currentItems.length) {
      setSelected([])
    } else {
      setSelected(currentItems.map(p => p._id))
    }
  }

  // Convert selected file to data URL and preview
  const handleFileSelect = async (file: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = String(reader.result || "")
        setForm(prev => ({ ...prev, image: dataUrl }))
        setImagePreview(dataUrl)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Image read error:', err)
      toast.error('Failed to read image')
    }
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const removeSelectedImage = () => {
    setForm(prev => ({ ...prev, image: "" }))
    setImagePreview("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCreateProduct = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.name.trim() || !form.price.trim() || !form.artist.trim()) {
      toast.error('Please fill in name, price and artist')
      return
    }
    try {
      setCreating(true)
      await adminProductService.createProduct({
        name: form.name.trim(),
        price: form.price.trim(),
        artist: form.artist.trim(),
        stock: Number(form.stock) || 0,
        image: form.image.trim() || undefined,
        categoryId: form.category || undefined
      })
      toast.success('Product created')
      setIsAddOpen(false)
      setForm({ name: "", price: "", artist: "", stock: 0, image: "", category: "", description: "" })
      setImagePreview("")
      await fetchProducts()
    } catch (error) {
      console.error('Create product error:', error)
      toast.error('Failed to create product')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start">
        <h1
          className="text-4xl font-bold font-[DrukWideBold] text-neutral-800"
        >
          PRODUCTS
        </h1>
        <div className="w-90 h-2 bg-[#BB3C36] mt-2"></div>
      </div>
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetTrigger asChild>
          <Button className="bg-[#f1b33a] hover:bg-[#dea928] text-[#232227] rounded-xl px-5 flex items-center gap-4">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto rounded-l-3xl border-l-1 shadow-2xl">
          <SheetHeader>
            <SheetTitle className="text-2xl font-semibold">Add New Product</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleCreateProduct} className="mt-6">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2 ml-3  mr-3">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input id="name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" className="focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-black" />
              </div>
              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="price" className="text-sm font-medium">Price</Label>
                <Input id="price" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} placeholder="e.g. 19.99" className="focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-black" />
              </div>
              <div className="space-y-2 ml-3  mr-3">
                <Label htmlFor="artist" className="text-sm font-medium">Artist</Label>
                <Input id="artist" value={form.artist} onChange={e => setForm(prev => ({ ...prev, artist: e.target.value }))} placeholder="Artist name" className="focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-black" />
              </div>
              <div className="space-y-2 ml-3  mr-3">
                <Label htmlFor="stock" className="text-sm font-medium">Stock</Label>
                <Input id="stock" type="number" min={0} value={form.stock} onChange={e => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))} placeholder="0" className="focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-black" />
              </div>

              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <select 
                  id="category" 
                  value={form.category} 
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <textarea 
                  id="description" 
                  value={form.description} 
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="Product description..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                />
              </div>

              {/* Image Picker */}
              <div className="space-y-2 ml-3  mr-3">
                <Label className="text-sm font-medium">Product Image</Label>
                <div className="rounded-2xl border border-dashed border-black p-6 bg-neutral-50">
                  <div className="flex items-center gap-4 bg-[#eeeee4] rounded-xl">
                    {imagePreview || form.image ? (
                      <div className="relative">
                        <Image src={imagePreview || form.image} alt="preview" width={120} height={120} className="rounded-2xl object-cover border border-white bg-white" />
                        <button type="button" onClick={removeSelectedImage} className=" absolute -top-2 -right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-[120px] h-[120px] rounded-2xl bg-white border border-white flex items-center justify-center text-neutral-400">No image</div>
                    )}

                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Paste image URL (optional)"
                          value={form.image && form.image.startsWith('data:') ? '' : form.image}
                          onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
                          className="flex-1 focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-white"
                        />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 rounded-xl px-4 py-3 border-white">
                          <Upload className="w-4 h-4" /> Upload
                        </Button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInputChange} />
                      </div>
                      <p className="text-xs text-neutral-500">You can paste an image URL or upload from your computer. Uploaded files are embedded as Data URL.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={creating} className="rounded-xl px-6 py-3">Cancel</Button>
                <Button type="submit" disabled={creating} className="bg-[#f1b33a] hover:bg-[#dea928] text-[#232227] rounded-xl px-6 py-3">{creating ? 'Creating...' : 'Create'}</Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Product Modal */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto rounded-l-3xl border-l-1 shadow-2xl">
          <SheetHeader>
            <SheetTitle className="text-2xl font-semibold">Edit Product</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleUpdateProduct} className="mt-6">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="edit-name" className="text-sm font-medium">Name</Label>
                <Input id="edit-name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" className="focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-black" />
              </div>
              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="edit-price" className="text-sm font-medium">Price</Label>
                <Input id="edit-price" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} placeholder="e.g. 19.99" className="focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-black" />
              </div>
              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="edit-artist" className="text-sm font-medium">Artist</Label>
                <Input id="edit-artist" value={form.artist} onChange={e => setForm(prev => ({ ...prev, artist: e.target.value }))} placeholder="Artist name" className="focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-black" />
              </div>
              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="edit-stock" className="text-sm font-medium">Stock</Label>
                <Input id="edit-stock" type="number" min={0} value={form.stock} onChange={e => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))} placeholder="0" className="focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-black" />
              </div>

              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="edit-category" className="text-sm font-medium">Category</Label>
                <select 
                  id="edit-category" 
                  value={form.category} 
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <textarea 
                  id="edit-description" 
                  value={form.description} 
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="Product description..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                />
              </div>

              {/* Image Picker */}
              <div className="space-y-2 ml-3 mr-3">
                <Label className="text-sm font-medium">Product Image</Label>
                <div className="rounded-2xl border border-dashed border-black p-6 bg-neutral-50">
                  <div className="flex items-center gap-4 bg-[#eeeee4] rounded-xl">
                    {imagePreview || form.image ? (
                      <div className="relative">
                        <Image src={imagePreview || form.image} alt="preview" width={120} height={120} className="rounded-2xl object-cover border border-white bg-white" />
                        <button type="button" onClick={removeSelectedImage} className="absolute -top-2 -right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-[120px] h-[120px] rounded-2xl bg-white border border-white flex items-center justify-center text-neutral-400">No image</div>
                    )}

                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Paste image URL (optional)"
                          value={form.image && form.image.startsWith('data:') ? '' : form.image}
                          onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
                          className="flex-1 focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-xl px-4 py-3 border-white"
                        />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 rounded-xl px-4 py-3 border-white">
                          <Upload className="w-4 h-4" /> Upload
                        </Button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInputChange} />
                      </div>
                      <p className="text-xs text-neutral-500">You can paste an image URL or upload from your computer. Uploaded files are embedded as Data URL.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={updating} className="rounded-xl px-6 py-3">Cancel</Button>
                <Button type="submit" disabled={updating} className="bg-[#f1b33a] hover:bg-[#dea928] text-[#232227] rounded-xl px-6 py-3">{updating ? 'Updating...' : 'Update'}</Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 w-full max-w-full">
        {/* Toolbar */}
        <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <ArrowUpDown className='h-4 w-4' />
                  <span className='truncate'>
                    {sortOptions.find((o) => o.value === selectedSort)?.label || 'Sắp xếp'}
                  </span>
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-48'>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSelectedSort(option.value)}
                    className={selectedSort === option.value ? 'bg-muted font-semibold' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>

            {/* Price Range Filter */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 text-sm"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 text-sm"
              />
            </div>

            {/* Stock Range Filter */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min Stock"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-24 text-sm"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="Max Stock"
                value={maxStock}
                onChange={(e) => setMaxStock(e.target.value)}
                className="w-24 text-sm"
              />
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search..."
                className="w-72 pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              
            </div>
            <Button 
              variant="outline" 
              className="p-2 w-9 h-9"
              onClick={clearAllFilters}
              title="Clear all filters"
            >
              <X className="w-4 h-4"/>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="p-2 w-9 h-9"
              disabled={selected.length !== 1}
              onClick={() => {
                if (selected.length === 1) {
                  const product = products.find(p => p._id === selected[0])
                  if (product) handleEditProduct(product)
                }
              }}
              title="Edit selected product"
            >
              <Pencil className="w-4 h-4"/>
            </Button>
            
            <Button 
              variant="outline" 
              className="p-2 w-9 h-9"
              onClick={handleDeleteMultiple}
              disabled={selected.length === 0}
              title={`Delete ${selected.length} selected product${selected.length !== 1 ? 's' : ''}`}
            >
              <Trash2 className="w-4 h-4"/>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox 
                    checked={selected.length === currentItems.length && currentItems.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map(p => (
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
                      <div className="text-gray-500 text-sm">{p.categoryId?.name || 'No Category'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{p.stock} in stock</TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>{p.artist}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 w-8 h-8"
                        onClick={() => handleEditProduct(p)}
                        title="Edit product"
                      >
                        <Pencil className="w-4 h-4"/>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 w-8 h-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteProduct(p._id)}
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
          <div className="text-xs text-gray-500">
            {sortedProducts.length} Results
          </div>
          <div className="flex items-center gap-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {(() => {
                  const nums: (number | string)[] = []
                  const maxButtons = 5
                  const totalPages = Math.ceil(sortedProducts.length / perPage) || 1
                  if (totalPages <= maxButtons) {
                    for (let i = 1; i <= totalPages; i++) nums.push(i)
                  } else {
                    nums.push(1)
                    let start = Math.max(2, page - 1)
                    let end = Math.min(totalPages - 1, page + 1)
                    if (page < 3) { start = 2; end = 4 }
                    if (page > totalPages - 2) { start = totalPages - 3; end = totalPages - 1 }
                    if (start > 2) nums.push('...')
                    for (let i = start; i <= end; i++) nums.push(i)
                    if (end < totalPages - 1) nums.push('...')
                    nums.push(totalPages)
                  }
                  return nums.map((p, idx) => (
                    <PaginationItem key={`${p}-${idx}`}>
                      {p === '...' ? (
                        <PaginationEllipsis className='cursor-default' />
                      ) : (
                        <PaginationLink
                          isActive={page === (p as number)}
                          onClick={() => handlePageChange(p as number)}
                          className='cursor-pointer'
                        >
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))
                })()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    className={page >= (Math.ceil(sortedProducts.length / perPage) || 1) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className='flex items-center gap-2'>
              <span className='text-sm'>Go to</span>
              <input
                type='number'
                min={1}
                max={Math.ceil(sortedProducts.length / perPage) || 1}
                value={inputPage}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  const max = Math.ceil(sortedProducts.length / perPage) || 1
                  if (value >= 1 && value <= max) {
                    setInputPage(value)
                  } else if (e.target.value === '') {
                    setInputPage(1)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const max = Math.ceil(sortedProducts.length / perPage) || 1
                    const valid = Math.max(1, Math.min(inputPage, max))
                    handlePageChange(valid)
                  }
                }}
                onBlur={() => {
                  const max = Math.ceil(sortedProducts.length / perPage) || 1
                  const valid = Math.max(1, Math.min(inputPage, max))
                  setInputPage(valid)
                }}
                className='w-16 px-2 py-1 border rounded text-sm text-center'
              />
              <span className='text-sm'>/ {Math.ceil(sortedProducts.length / perPage) || 1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
