'use client';

import { useState } from 'react';
import { createMoMoPayment } from '@/lib/services/payment';
import Image from 'next/image';

interface MoMoPaymentButtonProps {
  amount: string;
  className?: string;
  onPaymentInitiated?: () => void;
  onPaymentError?: (error: string) => void;
}

export default function MoMoPaymentButton({
  amount,
  className = '',
  onPaymentInitiated,
  onPaymentError
}: MoMoPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // Format amount - remove any non-numeric characters and ensure it's a string
      const formattedAmount = amount.toString().replace(/[^\d]/g, '');
      
      if (!formattedAmount || parseInt(formattedAmount) <= 0) {
        throw new Error('Invalid payment amount');
      }
      
      // Call the payment service
      const response = await createMoMoPayment(formattedAmount);
      
      if (response.success && response.payUrl) {
        // Notify parent component
        if (onPaymentInitiated) {
          onPaymentInitiated();
        }
        
        // Redirect to MoMo payment page
        window.location.href = response.payUrl;
      } else {
        // Handle error
        if (onPaymentError) {
          onPaymentError(response.message || 'Payment initiation failed');
        }
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      if (onPaymentError) {
        onPaymentError(error instanceof Error ? error.message : 'Payment initiation failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`flex items-center justify-center px-6 py-3 bg-[#d82d8b] text-white rounded-lg hover:bg-[#b71c7b] transition-colors ${className}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <div className="flex items-center">
          <span className="mr-2">Pay with</span>
          <span className="font-bold text-lg">MoMo</span>
        </div>
      )}
    </button>
  );
} 