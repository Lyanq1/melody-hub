import Link from "next/link"
export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="container flex justify-between items-center p-4">
        <Link href="/">Logo app</Link>
        <div className="flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/checkout">Checkout</Link>
          <Link href="/products">Products</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/cart">Cart</Link>
        </div>
      </div>
    </nav>
  )
}
