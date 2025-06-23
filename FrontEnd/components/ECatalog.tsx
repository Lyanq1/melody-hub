// components/Ecatalog.tsx
import React from 'react'

// Định nghĩa một interface cho mỗi mục trong catalog (tùy chọn nhưng nên có để rõ ràng)
interface CatalogItem {
  id: string
  name: string
  link: string
}

// Dữ liệu mẫu cho catalog (bạn có thể lấy từ API hoặc một nguồn khác)
const catalogItems: CatalogItem[] = [
  { id: '1', name: 'Pop', link: '/products?category=pop' },
  { id: '2', name: 'Rock', link: '/products?category=rock' },
  { id: '3', name: 'Indie', link: '/products?category=indie' },
  { id: '4', name: 'EDM', link: '/products?category=edm' },
  { id: '5', name: 'Hip-Hop', link: '/products?category=hip-hop' },
  { id: '6', name: 'Classical', link: '/products?category=classical' },
  { id: '7', name: 'Jazz', link: '/products?category=jazz' }
  // Thêm các danh mục khác nếu cần
]

const Ecatalog: React.FC = () => {
  return (
    <div className='bg-white py-3 border-b border-gray-200' style={{ fontFamily: 'MicaValo' }}>
      <div className='container mx-auto px-4'>
        <ul className='flex flex-nowrap justify-center space-x-6 overflow-x-auto overflow-y-hidden scrollbar-hide'>
          {catalogItems.map((item) => (
            <li key={item.id} className='flex-shrink-0'>
              <a
                href={item.link}
                className='text-4xl text-gray-700 hover:text-purple-600 font-medium px-3 py-1 rounded-md transition-colors duration-200 whitespace-nowrap hover:underline hover:italic'
                style={{ fontFamily: 'MicaValo' }}
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Ecatalog
