'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { verifyMoMoPayment } from '@/lib/services/payment'
import { createOrder, type Order } from '@/lib/services/order'
import axios from 'axios'

function CheckoutSuccessContent() {
  // const router = useRouter();
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [orderCreating, setOrderCreating] = useState(false)

  // Get payment status from URL parameters
  // MoMo might return different parameter names depending on the version
  const orderId = searchParams.get('orderId') || searchParams.get('orderid');
  const resultCode = searchParams.get('resultCode') || searchParams.get('resultcode');
  const message = searchParams.get('message') || searchParams.get('errorMessage');
  const stripeSessionId = searchParams.get('session_id');
  // const extraData = searchParams.get('extraData');

  useEffect(() => {
    const verifyPayment = async () => {
      if (orderId && resultCode) {
        try {
          setVerifying(true)
          const response = await verifyMoMoPayment(orderId, resultCode)

          if (response.success) {
            setVerified(response.verified || false)
          } else {
            setError(response.message || 'Payment verification failed')
            setVerified(false)
          }
        } catch (error) {
          console.error('Error verifying payment:', error)
          setError('Failed to verify payment status')
          setVerified(false)
        } finally {
          setVerifying(false)
        }
      } else if (stripeSessionId) {
        // For Stripe, successful redirect includes session_id. We consider it success for UI purposes.
        // The definitive record should be confirmed via webhook on backend.
        setVerified(true)
        setVerifying(false)
      } else {
        setVerifying(false)
        setError('Missing payment information')
        setVerified(false)
      }
    }

    verifyPayment()
  }, [orderId, resultCode, stripeSessionId])

  // Create order after successful payment
  useEffect(() => {
    const createOrderAfterPayment = async () => {
      if ((resultCode === '0' || stripeSessionId) && verified && !order) {
        try {
          setOrderCreating(true)
          
          // Get customer info from localStorage
          const customerInfoStr = localStorage.getItem('customerInfo')
          if (!customerInfoStr) {
            console.error('No customer info found')
            return
          }

          const customerInfo = JSON.parse(customerInfoStr)
          
          // Get user ID from token
          const token = localStorage.getItem('token')
          if (!token) {
            console.error('No token found')
            return
          }

          const payload = JSON.parse(atob(token.split('.')[1]))
          const userId = payload.accountID

          if (!userId) {
            console.error('No user ID found in token')
            return
          }

          // Determine payment method and status
          let paymentMethod: 'Stripe' | 'MoMo' | 'Cash on Delivery' = 'Cash on Delivery'
          let paymentStatus: 'Pending' | 'Completed' | 'Failed' = 'Completed'

          if (stripeSessionId) {
            paymentMethod = 'Stripe'
          } else if (resultCode === '0') {
            paymentMethod = 'MoMo'
          } else if (orderId?.startsWith('COD-')) {
            paymentMethod = 'Cash on Delivery'
          }

          // Create order
          const orderResponse = await createOrder({
            userId,
            customerInfo,
            paymentMethod,
            paymentStatus
          })

          if (orderResponse.success && orderResponse.order) {
            setOrder(orderResponse.order)
            console.log('Order created successfully:', orderResponse.order)
          } else {
            console.error('Failed to create order:', orderResponse.message)
          }

        } catch (error) {
          console.error('Error creating order:', error)
        } finally {
          setOrderCreating(false)
        }
      }
    }

    createOrderAfterPayment()
  }, [resultCode, stripeSessionId, verified, order])

  // Clear cart after successful payment
  useEffect(() => {
    const clearCart = async () => {
      if ((resultCode === '0' || stripeSessionId) && verified) {
        try {
          const token = localStorage.getItem('token')
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const userId = payload.accountID
            
            if (userId) {
              await axios.delete(`http://localhost:5000/api/cart/${userId}`)
              console.log('Cart cleared after successful payment')
            }
          }
        } catch (error) {
          console.error('Error clearing cart:', error)
        }
      }
    }

    clearCart()
  }, [resultCode, stripeSessionId, verified])

  if (verifying || orderCreating) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl p-8'>
          <div className='text-center'>
            <div className='mb-4'>
              <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto'></div>
            </div>
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>
              {verifying ? 'Verifying Payment' : 'Creating Order'}
            </h1>
            <p className='text-gray-600'>
              {verifying ? 'Please wait while we verify your payment...' : 'Please wait while we create your order...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl p-8'>
        {(resultCode === '0' || stripeSessionId) && verified ? (
          <div className='text-center'>
            <div className='mb-4 text-green-500'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-16 w-16 mx-auto'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>Payment Successful!</h1>
            <p className='text-gray-600 mb-6'>
              Thank you for your purchase. Your order has been processed successfully.
            </p>
            
            {order && (
              <div className='mb-6 text-left bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold mb-2'>Order Details:</h3>
                <p className='text-sm text-gray-600 mb-1'>Order ID: {order._id}</p>
                <p className='text-sm text-gray-600 mb-1'>Total: {order.totalPrice?.toLocaleString('vi-VN')}₫</p>
                <p className='text-sm text-gray-600 mb-1'>Status: {order.status}</p>
                <p className='text-sm text-gray-600 mb-1'>Payment Method: {order.paymentMethod}</p>
                <p className='text-sm text-gray-600'>Date: {new Date(order.createdDate).toLocaleDateString('vi-VN')}</p>
              </div>
            )}
            
            <div className='mt-6'>
              <Link
                href='/homepage'
                className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300'
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className='text-center'>
            <div className='mb-4 text-red-500'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-16 w-16 mx-auto'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>Payment Failed</h1>
            <p className='text-gray-600 mb-6'>{error || message || 'There was an issue processing your payment.'}</p>
            <p className='text-sm text-gray-500 mb-6'>Error Code: {resultCode}</p>
            <div className='mt-6 space-x-4'>
              <Link
                href='/checkout'
                className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300'
              >
                Try Again
              </Link>
              <Link
                href='/homepage'
                className='bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition duration-300'
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default function CheckoutSuccess() {
  return (
    <Suspense fallback={
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl p-8'>
          <div className='text-center'>
            <div className='mb-4'>
              <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto'></div>
            </div>
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>Loading...</h1>
            <p className='text-gray-600'>Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}