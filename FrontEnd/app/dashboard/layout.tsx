'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Disc, ShoppingCart, Users, Database, Settings } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      icon: Disc,
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Customers',
      href: '/dashboard/customers',
      icon: Users,
    },
    {
      name: 'Scraper',
      href: '/dashboard/scraper',
      icon: Database,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-58 bg-gray-900 text-white">
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 font-[Tangkiwood] tracking-wide text-center">MELODY HUB</h2>
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-100">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 