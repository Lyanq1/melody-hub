'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import MoMoPaymentButton from '@/components/ui/momo-payment-button';

interface CartItem {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
  imageUrl: string;
}

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Fetch cart items from localStorage
  useEffect(() => {
    const fetchCart = () => {
      try {
        const stored = localStorage.getItem('cart');
        if (stored) {
          const parsedCart = JSON.parse(stored) as CartItem[];
          setCartItems(parsedCart);
          
          // Calculate total amount
          const total = parsedCart.reduce((sum, item) => {
            let price = 0;
            if (typeof item.price === 'string') {
              price = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 0;
            } else if (typeof item.price === 'number') {
              price = item.price;
            }
            return sum + price * item.quantity;
          }, 0);
          
          setTotalAmount(total.toString());
        } else {
          // Redirect to cart if no items
          router.push('/cart');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load cart items');
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInitiated = () => {
    // You could save the order to your database here
    console.log('Payment initiated for amount:', totalAmount);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={customerInfo.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Shipping Address</label>
              <textarea
                name="address"
                value={customerInfo.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {cartItems.length > 0 ? (
              <div>
                <div className="mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        {typeof item.price === 'string' 
                          ? item.price 
                          : item.price.toLocaleString('vi-VN') + '₫'}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <p>Subtotal</p>
                    <p>{parseInt(totalAmount).toLocaleString('vi-VN')}₫</p>
                  </div>
                  <div className="flex justify-between mb-2">
                    <p>Shipping</p>
                    <p>Free</p>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>{parseInt(totalAmount).toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Payment Methods</h3>
                  
                  <MoMoPaymentButton 
                    amount={totalAmount}
                    onPaymentInitiated={handlePaymentInitiated}
                    onPaymentError={handlePaymentError}
                    className="w-full"
                  />
                  
                  <button className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                    Cash on Delivery
                  </button>
                </div>
              </div>
            ) : (
              <p>Your cart is empty</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}