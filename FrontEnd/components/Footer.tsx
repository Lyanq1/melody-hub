'use client'

import React from 'react'
import Link from 'next/link'

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-[#FFFFFF] py-8 border-t border-[var(--border)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start text-left gap-8 text-sm md:text-base">
          {/* Logo và mô tả - Sử dụng font MicaValo cho logo */}
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <h1 style={{ fontFamily: 'Cerova', fontSize: '50px' }} className="text-xl">ECHO <br /> RECORDS</h1>
            </Link>
            <p className="mt-4 text-sm font-['Inter_Tight'] text-[var(--muted-foreground)]">
              Nền tảng kết nối nghệ sĩ và khách hàng, <br /> mang nghệ thuật đến gần hơn với mọi người.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h1 style={{ fontSize: '40px' }} className="text-lg font-['Cerova'] mb-4">THÔNG TIN</h1>
            <ul className="space-y-2 text-sm font-['Inter_Tight']">
              <li><Link href="/about" className="hover:text-[var(--primary)]">Giới thiệu</Link></li>
              <li><Link href="/services" className="hover:text-[var(--primary)]">Dịch vụ</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--primary)]">Liên hệ</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--primary)]">FAQ</Link></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h1 style={{ fontSize: '40px' }} className="text-lg font-['Cerova'] mb-4">TRỢ GIÚP</h1>
            <ul className="space-y-2 text-sm font-['Inter_Tight']">
              <li><Link href="/thanhtoan" className="hover:text-[var(--primary)]">Thanh toán</Link></li>
              <li><Link href="/giaohang" className="hover:text-[var(--primary)]">Giao hàng</Link></li>
              <li><Link href="/baomat" className="hover:text-[var(--primary)]">Chính sách bảo mật</Link></li>
              <li><Link href="/huongdan" className="hover:text-[var(--primary)]">Hướng dẫn mua hàng</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h1 style={{ fontSize: '40px' }} className="text-lg font-['Cerova'] mb-4">FOLLOW US</h1>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.962 6.817h-3.308l7.717-8.829-8.148-10.671h6.657l4.714 6.213zm-1.877 17.296h1.843l-11.865-15.754h-1.843z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.542.069-2.908.377-3.986 1.455-1.078 1.078-1.386 2.444-1.455 3.986-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.069 1.542.377 2.908 1.455 3.986 1.078 1.078 2.444 1.386 3.986 1.455 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.542-.069 2.908-.377 3.986-1.455 1.078-1.078 1.386-2.444 1.455-3.986.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.069-1.542-.377-2.908-1.455-3.986-1.078-1.078-2.444-1.386-3.986-1.455-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.441s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.441-1.441-1.441z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm font-['Inter_Tight'] text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} Echo Records. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer