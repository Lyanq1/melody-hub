'use client';

import { useState } from 'react';
import OrderTracker from './OrderTracker';

export default function TrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [showTracker, setShowTracker] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (orderId.trim()) setShowTracker(true);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Track Your Order</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Enter your Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button className="bg-black text-white px-4 rounded" type="submit">
          Track
        </button>
      </form>

      {showTracker && <OrderTracker orderId={orderId} />}
    </div>
  );
}
