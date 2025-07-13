'use client'

import { useState } from 'react'
import { createMoMoPayment } from '@/lib/services/payment'

interface MoMoPaymentButtonProps {
  amount: string;
  className?: string;
  disabled?: boolean;
  onPaymentInitiated?: () => void;
  onPaymentError?: (error: string) => void;
}

export default function MoMoPaymentButton({
  amount,
  className = '',
  disabled = false,
  onPaymentInitiated,
  onPaymentError
}: MoMoPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      // Format amount - remove any non-numeric characters and ensure it's a string
      const formattedAmount = amount.toString().replace(/[^\d]/g, '')

      if (!formattedAmount || parseInt(formattedAmount) <= 0) {
        throw new Error('Invalid payment amount')
      }

      // Call the payment service
      const response = await createMoMoPayment(formattedAmount);
      
      // Handle the new response format
      if (response.success) {
        // Notify parent component
        if (onPaymentInitiated) {
          onPaymentInitiated()
        }
        
        // Check if payUrl is directly in response or in data property
        const payUrl = response.payUrl || (response.data && response.data.payUrl);
        
        if (payUrl) {
          // Redirect to MoMo payment page
          window.location.href = payUrl;
        } else {
          throw new Error('No payment URL received from server');
        }
      } else {
        // Handle error
        if (onPaymentError) {
          onPaymentError(response.message || 'Payment initiation failed')
        }
      }
    } catch (error) {
      console.error('Error initiating payment:', error)
      if (onPaymentError) {
        onPaymentError(error instanceof Error ? error.message : 'Payment initiation failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || disabled}
      className={`flex items-center justify-center px-6 py-3 ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#d82d8b] hover:bg-[#b71c7b]'} text-white rounded-lg transition-colors ${className}`}
    >
      {isLoading ? (
        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
      ) : (
        <div className='flex items-center'>
          <span className='mr-2'>Pay with</span>
          <span className='font-bold text-lg'>MoMo</span>
        </div>
      )}
    </button>
  )
}
