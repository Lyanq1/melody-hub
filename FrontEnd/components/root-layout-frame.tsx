'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import Footer from '@/components/Footer'
import { AdminNavbar } from '@/components/ui/admin-navbar'
import { useAuth } from '@/hooks/use-auth'

type Props = {
  children: React.ReactNode
}

export default function RootLayoutFrame({ children }: Props) {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  const isAdminRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
  const showAdminShell = isAdmin && isAdminRoute

  if (showAdminShell) {
    return (
      <>
        <AdminNavbar />
        <main className="flex-grow">{children}</main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  )
}


