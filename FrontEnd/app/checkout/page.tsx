'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import MoMoPaymentButton from '@/components/ui/momo-payment-button';
import { createStripeCheckoutSession } from '@/lib/services/payment';
import axios from 'axios';
import { productService } from '@/lib/services/product';

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
  const [formValid, setFormValid] = useState(false);

  // Fetch cart items from API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        // Get user ID from token
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userId = payload.accountID
  
        if (!userId) {
          router.push('/login')
          return
        }
  
        // Fetch cart from API
        const response = await axios.get(`http://localhost:5000/api/cart/${userId}`)
        const cart = response.data
        
        if (cart && cart.items && cart.items.length > 0) {
          // Ensure we have accurate product data (especially price as string like "120.000₫")
          const transformedItems: CartItem[] = await Promise.all(
            cart.items.map(async (item: any) => {
              const product = item.product ? item.product : await productService.getProductById(item.discId)
              return {
                id: item.discId,
                name: product?.name || 'Product',
                price: product?.price || '0',
                quantity: Number(item.quantity) || 0,
                imageUrl: product?.image || '/placeholder-image.jpg'
              }
            })
          )

          setCartItems(transformedItems)
          // Calculate total amount robustly from transformedItems
          const total = transformedItems.reduce((sum, item) => {
            let priceNumber = 0
            if (typeof item.price === 'string') {
              // remove all non-digits (handles formats like "120.000₫" or "120,000 VND")
              priceNumber = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 0
            } else if (typeof item.price === 'number') {
              priceNumber = item.price
            }
            return sum + priceNumber * (Number(item.quantity) || 0)
          }, 0)
          
          // Store the numeric total for order creation
          setTotalAmount(String(total))
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

  
  // Validate form when customer info changes
  useEffect(() => {
    const { name, email, phone, address } = customerInfo;
    setFormValid(name.trim() !== '' && email.trim() !== '' && phone.trim() !== '' && address.trim() !== '');
  }, [customerInfo]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInitiated = () => {
    // Save customer info to localStorage for order processing
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
    console.log('Payment initiated for amount:', totalAmount);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleStripeCheckout = async () => {
    if (!formValid) {
      setError('Please fill in all customer information fields');
      return;
    }
    try {
      setError('');
      // Save customer info for later order processing
      localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
      const amountNumber = parseInt(totalAmount, 10) || 0;
      const res = await createStripeCheckoutSession(amountNumber, 'MelodyHub Order');
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        setError(res.message || 'Failed to start Stripe checkout');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start Stripe checkout');
    }
  }

  const handleCashOnDelivery = () => {
    if (!formValid) {
      setError('Please fill in all customer information fields');
      return;
    }
    
    // Save order information
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
    
    // Redirect to success page with COD flag
    router.push('/checkout/success?resultCode=0&orderId=COD-' + Date.now() + '&message=Cash on Delivery');
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
                    disabled={!formValid}
                  />
                  
                  <button
                    className="w-full px-6 py-3 bg-black text-white rounded-lg hover:opacity-90 transition-colors"
                    onClick={handleStripeCheckout}
                    disabled={!formValid}
                  >
                    Pay with Stripe
                  </button>
                  
                  <button 
                    className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={handleCashOnDelivery}
                    disabled={!formValid}
                  >
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