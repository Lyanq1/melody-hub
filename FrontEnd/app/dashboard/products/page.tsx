// // page.tsx (Trang quản lý sản phẩm)
// 'use client';
// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// // import { Product, productService } from '@/lib/services/product';
// import Image from 'next/image';

// type Product = {
//   _id: string
//   name: string
//   price: string
//   image: string
//   categoryId: string
//   // Add more fields if needed
// }

// export default function ProductManager() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);

//   // useEffect(() => {
//   //   const fetchProducts = async () => {
//   //     try {
//   //       const data = await productService.getAllProducts();
//   //       setProducts(data);
//   //     } catch (error) {
//   //       console.error('Error fetching products:', error);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchProducts();
//   // }, []);




//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-bold">Quản lý sản phẩm</h1>
//         <Button>+ Thêm sản phẩm</Button>
//       </div>

//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-[100px]">Hình ảnh</TableHead>
//             <TableHead>Tên sản phẩm</TableHead>
//             <TableHead>Giá</TableHead>
//             <TableHead>Thương hiệu</TableHead>
//             <TableHead>Trạng thái</TableHead>
//             <TableHead className="text-right">Thao tác</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {products.map((product) => (
//             <TableRow key={product._id}>
//               <TableCell>
//                 <div className="relative w-16 h-16">
//                   <Image
//                     src={product.image}
//                     alt={product.name}
//                     fill
//                     className="object-cover rounded"
//                     sizes="64px"
//                   />
//                 </div>
//               </TableCell>
//               <TableCell className="font-medium">{product.name}</TableCell>
//               <TableCell>{product.price}₫</TableCell>
//               <TableCell>
//                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                   Còn hàng
//                 </span>
//               </TableCell>
//               <TableCell className="text-right">
//                 <Button variant="outline" size="sm" className="mr-2">
//                   Sửa
//                 </Button>
//                 <Button variant="destructive" size="sm">
//                   Xóa
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }
