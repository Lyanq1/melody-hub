import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import {Navbar}  from '@/components/ui/navbar'
import Footer from '@/components/Footer'
import { Toaster } from "sonner";
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Melody Hub',
  description: ''
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>{/* Không thêm Facebook SDK ở đây */}</head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-full flex-col`}
      >
        <Navbar />
        <main className="container mx-auto flex-grow">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}