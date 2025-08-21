// page.tsx (Trang quản lý khách hàng)
'use client'
import { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function CustomerManager() {
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then(setCustomers)
  }, [])

  return (
    <div className='p-6 bg-white rounded-xl shadow-md'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>👥 Danh sách khách hàng</h1>
          <p className='text-gray-500 text-sm'>Theo dõi danh sách và hoạt động của khách hàng</p>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-20'>ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className='text-right'>Số đơn hàng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell className='text-right'>{c.orderCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
