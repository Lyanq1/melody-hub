import Link from 'next/link'
import './components.css'
export const Navbar = () => {
  return (
    <nav style={{ backgroundColor: '#323031', fontSize: '20px' }} className='sticky top-0 z-50 text-white shadow-md'>
      <div style={{ fontFamily: 'MicaValo'}} className='container mx-auto flex items-center justify-between p-4'>        
        <Link href='/'>ECHO RECORDS</Link>
        <div className='flex gap-10 text-center'>
          <Link href='/'>home</Link>
          <Link href='/products'>products</Link>
        </div>
        {/* Search */}
        <div className="ui-input-container">
          <input
            placeholder="Search..."
            className="ui-input"
            type="text"
          />
          <div className="ui-input-underline"></div>
          <div className="ui-input-highlight"></div>
          <div className="ui-input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"></path>
            </svg>
          </div>
        </div>
        <div className='flex gap-10 text-center'>
          <Link href='/cart' className="flex items-center gap-2">
            <img src="/assets/cart.png" alt="Cart" className="w-6 h-6" />
          </Link>
          <Link href='/register' className="flex items-center gap-2">
            <img src="/assets/user.png" alt="Signup" className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
