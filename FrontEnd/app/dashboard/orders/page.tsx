'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Filter, Pencil, Trash2, ChevronDown, Eye, Calendar, DollarSign, Users, Package, X, ArrowUpDown } from 'lucide-react'
import { adminOrderService } from '@/lib/services/admin-order'
import { toast } from 'sonner'

type Order = {
  _id: string
  userId: {
    _id: string
    DisplayName: string
    Email: string
    Username: string
  }
  items: Array<{
    discId: string
    name: string
    price: number
    quantity: number
  }>
  totalPrice: number
  address: string
  paymentMethod: string
  paymentStatus: 'Pending' | 'Completed' | 'Failed'
  status: 'Confirmed' | 'Shipping' | 'Delivered' 
  statusHistory: Array<{
    status: string
    timestamp: string
    description: string
  }>
  createdAt: string
  updatedAt: string
}

type Stats = {
  orders: {
    total: number
    period: number
    pending: number
    Shipping: number
    completed: number
  }
  revenue: {
    total: number
    period: number
  }
  customers: {
    total: number
    new: number
  }
  products: {
    total: number
    lowStock: number
    outOfStock: number
  }
}

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([]) // Store all orders for frontend filtering
  const [stats, setStats] = useState<Stats | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all')
  const [selectedSort, setSelectedSort] = useState('')
  const perPage = 10

  const sortOptions = [
    { label: 'Mặc định', value: '' },
    { label: 'Giá: Cao đến thấp', value: 'price-desc' },
    { label: 'Giá: Thấp đến cao', value: 'price-asc' }
  ]

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sort function
  const sortOrders = useCallback((list: Order[], sortType: string): Order[] => {
    if (!sortType || !list || list.length === 0) return list;
    try {
      return [...list].sort((a, b) => {
        if (!a || !b) return 0;
        switch (sortType) {
          case 'price-asc': {
            return a.totalPrice - b.totalPrice;
          }
          case 'price-desc': {
            return b.totalPrice - a.totalPrice;
          }
          default:
            return 0;
        }
      });
    } catch (error) {
      console.warn('Sort error:', error);
      return list;
    }
  }, []);

  // Frontend filtering logic
  const filteredOrders = useMemo(() => {
    try {
      const filtered = allOrders.filter(order => {
        // Search filter
        if (search.trim()) {
          const searchLower = search.toLowerCase();
          const user = order.userId;
          if (!user) return false;
          
          const matchesSearch = 
            user.DisplayName?.toLowerCase().includes(searchLower) ||
            user.Email?.toLowerCase().includes(searchLower) ||
            user.Username?.toLowerCase().includes(searchLower) ||
            order._id.toLowerCase().includes(searchLower);
          
          if (!matchesSearch) return false;
        }

        // Status filter
        if (filterStatus !== 'all' && order.status !== filterStatus) {
          return false;
        }

        // Payment method filter
        if (filterPaymentMethod !== 'all' && order.paymentMethod !== filterPaymentMethod) {
          return false;
        }

        // Payment status filter
        if (filterPaymentStatus !== 'all' && order.paymentStatus !== filterPaymentStatus) {
          return false;
        }

        // Date range filter
        if (startDate || endDate) {
          const orderDate = new Date(order.createdAt);
          if (startDate && orderDate < new Date(startDate)) return false;
          if (endDate && orderDate > new Date(endDate)) return false;
        }

        return true;
      });

      // Apply sorting
      return sortOrders(filtered, selectedSort);
    } catch (error) {
      console.warn('Filter error:', error);
      return allOrders;
    }
  }, [allOrders, search, filterStatus, filterPaymentMethod, startDate, endDate, selectedSort, sortOrders]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / perPage);
  const currentOrders = useMemo(() => {
    try {
      return filteredOrders.slice((page - 1) * perPage, page * perPage);
    } catch (error) {
      console.warn('Pagination error:', error);
      return [];
    }
  }, [filteredOrders, page, perPage]);

  // Initial data fetch
  useEffect(() => {
    if (mounted) {
      fetchOrders();
      fetchStats();
    }
  }, [mounted]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterPaymentMethod, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await adminOrderService.getAllOrders({
        page: 1,
        limit: 100 // Fetch all orders since we're filtering on frontend
      })
      setAllOrders(response.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await adminOrderService.getComprehensiveStats('month')
      setStats(response)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      setUpdating(true)
      await adminOrderService.updateOrderStatus(selectedOrder._id, newStatus, statusNote)
      toast.success('Order status updated successfully')
      setIsStatusModalOpen(false)
      setNewStatus('')
      setStatusNote('')
      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return

    try {
      await adminOrderService.deleteOrder(orderId)
      toast.success('Order deleted successfully')
      fetchOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Failed to delete order')
    }
  }
  const clearAllFilters = () => {
    setSearch("")
    setFilterStatus("all")
    setFilterPaymentMethod("all")
    setStartDate("")
    setEndDate("")
    setSelectedSort("")
    setPage(1)
  }
  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === currentOrders.length) {
      setSelected([])
    } else {
      setSelected(currentOrders.map(o => o._id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800'
      case 'Shipping': return 'bg-purple-100 text-purple-800'
      case 'Delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-600'
      case 'Failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start">
        <h1 className="text-4xl font-bold font-[DrukWideBold] text-neutral-800">
          ORDERS
        </h1>
        <div className="w-90 h-2 bg-[#BB3C36] mt-2"></div>
      </div>

      {/* Search Results Status */}


      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.orders.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{stats.revenue.total.toLocaleString()}đ</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{stats.customers.total}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">{stats.orders.period}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="truncate">
                    {sortOptions.find((o) => o.value === selectedSort)?.label || 'Sắp xếp'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
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

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4" />
                  <span className="truncate">
                    Status: {filterStatus === 'all' ? 'All' : filterStatus}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Confirmed')}>
                  Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Shipping')}>
                  Shipping
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Delivered')}>
                  Delivered
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Payment Method Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <DollarSign className="h-4 w-4" />
                  <span className="truncate">
                    Method: {filterPaymentMethod === 'all' ? 'All' : filterPaymentMethod === 'Cash on Delivery' ? 'COD' : filterPaymentMethod}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setFilterPaymentMethod('all')}>
                  All Methods
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPaymentMethod('Cash on Delivery')}>
                  COD
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPaymentMethod('MoMo')}>
                  Momo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPaymentMethod('Stripe')}>
                  Stripe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Filters */}
            <Input
              type="date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              className="w-40"
              placeholder="Start Date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              className="w-40"
              placeholder="End Date"
            />

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search orders..."
                className="w-72 pl-9 pr-8"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearch('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="p-2 w-9 h-9"
              disabled={selected.length === 0}
              onClick={() => {
                if (confirm(`Delete ${selected.length} selected order(s)?`)) {
                  selected.forEach(handleDeleteOrder)
                }
              }}
              title={`Delete ${selected.length} selected order${selected.length !== 1 ? 's' : ''}`}
            >
              <Trash2 className="w-4 h-4"/>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full max-w-full overflow-x-auto">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={selected.length === currentOrders.length && currentOrders.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-24 whitespace-nowrap">Order ID</TableHead>
                <TableHead className="w-56 whitespace-nowrap">Customer</TableHead>
                <TableHead className="w-[320px] whitespace-nowrap">Items</TableHead>
                <TableHead className="w-28 whitespace-nowrap">Total</TableHead>
                <TableHead className="w-28 whitespace-nowrap">Method</TableHead>
                <TableHead className="w-36 whitespace-nowrap">Payment Status</TableHead>
                <TableHead className="w-30 whitespace-nowrap">Order Status</TableHead>
                <TableHead className="w-40 whitespace-nowrap">Date</TableHead>
                <TableHead className="w-28 whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.map(order => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(order._id)}
                      onCheckedChange={() => toggleSelect(order._id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm whitespace-nowrap">{order._id.slice(-8)}</TableCell>
                  <TableCell className="truncate">
                    <div className="max-w-[220px]">
                      <div className="font-medium truncate">{order.userId?.DisplayName || 'Unknown'}</div>
                      <div className="text-sm text-gray-500 truncate">{order.userId?.Email}</div>
                    </div>
                  </TableCell>
                                      <TableCell className="truncate">
                      <div className="text-sm max-w-[300px] truncate">
                        <span className="whitespace-nowrap">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        <div className="text-gray-500">
                          {order.items.map((item, index) => (
                            <div key={index} className="truncate">
                              {item.quantity}x {item.name.length > 30 ? `${item.name.substring(0, 30)}...` : item.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{order.totalPrice.toLocaleString()}đ</TableCell>
                    <TableCell className="whitespace-nowrap">{order.paymentMethod}</TableCell>
                    <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 w-8 h-8"
                        onClick={() => {
                          setSelectedOrder(order)
                          setNewStatus(order.status)
                          setIsStatusModalOpen(true)
                        }}
                        title="Update status"
                      >
                        <Pencil className="w-4 h-4"/>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 w-8 h-8"
                        onClick={() => {
                          setSelectedOrder(order)
                          // You can add a view details modal here
                        }}
                        title="View details"
                      >
                        <Eye className="w-4 h-4"/>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="p-2 w-8 h-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteOrder(order._id)}
                        title="Delete order"
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
            Showing {orders.length} of {filteredOrders.length} Orders
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Order Sheet */}
      <Sheet open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto rounded-l-3xl border-l-1 shadow-2xl">
          <SheetHeader>
            <SheetTitle className="text-2xl font-semibold">Edit Order</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleStatusUpdate} className="mt-6">
            <div className="grid grid-cols-1 gap-5">
              {/* Order ID */}
              <div className="space-y-2 ml-3 mr-3">
                <Label className="text-sm font-medium">Order ID</Label>
                <div className="text-gray-600 font-mono">
                  {selectedOrder?._id}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 ml-3 mr-3">
                <Label className="text-sm font-medium">Customer</Label>
                <div className="text-gray-600">
                  <div>{selectedOrder?.userId?.DisplayName}</div>
                  <div className="text-sm text-gray-500">{selectedOrder?.userId?.Email}</div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 ml-3 mr-3">
                <Label className="text-sm font-medium">Items</Label>
                <div className="text-gray-600">
                  {selectedOrder?.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-1 border-b last:border-0">
                      <span>{item.name} x {item.quantity}</span>
                      <span>{item.price.toLocaleString()}đ</span>
                    </div>
                  ))}
                  <div className="mt-2 font-semibold flex justify-between">
                    <span>Total:</span>
                    <span>{selectedOrder?.totalPrice.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="edit-status" className="text-sm font-medium">Status</Label>
                <select
                  id="edit-status"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Note */}
              <div className="space-y-2 ml-3 mr-3">
                <Label htmlFor="edit-note" className="text-sm font-medium">Status Note</Label>
                <textarea
                  id="edit-note"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note about this status change..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 border border-black focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                />
              </div>

              {/* Shipping Address */}
              <div className="space-y-2 ml-3 mr-3">
                <Label className="text-sm font-medium">Shipping Address</Label>
                <div className="text-gray-600">
                  {selectedOrder?.address}
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-2 ml-3 mr-3">
                <Label className="text-sm font-medium">Payment Information</Label>
                <div className="text-gray-600">
                  <div>Method: {selectedOrder?.paymentMethod}</div>
                  <div>Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(selectedOrder?.paymentStatus || '')}`}>
                    {selectedOrder?.paymentStatus}
                  </span></div>
                </div>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsStatusModalOpen(false)} 
                  disabled={updating}
                  className="rounded-xl px-6 py-3"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updating}
                  className="bg-[#f1b33a] hover:bg-[#dea928] text-[#232227] rounded-xl px-6 py-3"
                >
                  {updating ? 'Updating...' : 'Update Order'}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
