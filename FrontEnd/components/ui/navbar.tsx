import Link from 'next/link'
export const Navbar = () => {
  return (
    <nav style={{ backgroundColor: '#323031' }} className='sticky top-0 z-50 text-white shadow-md'>
      <div style={{ fontFamily: 'Poster' }} className='container flex justify-between items-center p-4'>
        <Link href='/'>ECHO RECORDS</Link>
        <div className='flex gap-4'>
          <Link href='/'>Home</Link>

          <Link href='/products'>Products</Link>
        </div>
        <div className='flex items-center space-x-10'>
          <Link href='/cart'>Cart</Link>
          <Link href='/checkout'>Checkout</Link>
          <Link href='/register'>Signup</Link>
        </div>
      </div>
    </nav>
  )
}
