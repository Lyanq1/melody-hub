// import type { Metadata } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
// import './globals.css'
// import {Navbar}  from '@/components/ui/navbar'
// import Footer from '@/components/Footer'
// import { Toaster } from "sonner";
// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin']
// })

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin']
// })

// export const metadata: Metadata = {
//   title: 'Echo Records',
//   description: ''
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <head />
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
//         {children}
//       </body>
//     </html>
//   );
// }


import { Geist, Geist_Mono } from 'next/font/google'
import { Navbar } from '@/components/ui/navbar'
import Footer from '@/components/Footer'
import { Toaster } from "sonner";
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>{/* Không thêm Facebook SDK ở đây */}</head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}