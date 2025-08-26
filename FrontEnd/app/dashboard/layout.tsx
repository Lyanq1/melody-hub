'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Disc3 , Package, UsersRound, Database, Cog } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: House,
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      icon: Disc3 ,
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: Package,
    },
    {
      name: 'Customers',
      href: '/dashboard/customers',
      icon: UsersRound,
    },
    {
      name: 'Scraper',
      href: '/dashboard/scraper',
      icon: Database,
    },
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex min-h-screen bg-white">
        {/* Sidebar */}
        <aside className="w-58 bg-black font-semibold font-['Inter_Tight'] text-white border-r border-gray-200">
          <div className="p-4">
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
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 