// page.tsx (Trang quản lý sản phẩm)
'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ProductManager() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Quản lý sản phẩm</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Danh mục</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.price}₫</TableCell>
              <TableCell>{p.category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button className="mt-4">+ Thêm sản phẩm</Button>
    </div>
  );
}
