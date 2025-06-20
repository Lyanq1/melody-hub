import Link from 'next/link'
export const Navbar = () => {
  return (
    <nav style={{ backgroundColor: '#323031', fontSize: '20px' }} className='sticky top-0 z-50 text-white shadow-md'>
      <div style={{ fontFamily: 'MicaValo', margin: '0 auto', textAlign: 'center' }} className='container flex justify-center items-center p-4'>        
        <div className='flex gap-10 text-center'>
          <Link href='/'>HOME</Link>
          <Link href='/products'>PRODUCTS</Link>
          <Link href='/'>ECHO RECORDS</Link>
          <Link href='/cart'>CART</Link>
          <Link href='/register'>SIGNUP</Link>
        </div>
      </div>
    </nav>
  )
}
