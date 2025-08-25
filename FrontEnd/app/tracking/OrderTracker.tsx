'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import OrderStatusSteps from './OrderStatusSteps';

interface Order {
  _id: string;
  userId: {
    name: string;
  };
  shippingAddress: {
    addressLine: string;
    city: string;
    country: string;
  };
  createdDate: string;
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
}

interface Props {
  orderId: string;
}

export default function OrderTracker({ orderId }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        const data: Order = res.data;
        setOrder(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Order not found');
        setOrder(null);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!order) return <div>Loading...</div>;

  return (
    <div className="border p-6 rounded-xl shadow-xl bg-white space-y-4">
        <h2 className="text-2xl font-bold">Order #{order._id}</h2>
        <div className="text-sm text-gray-600">
            <p><strong>Customer:</strong> {order.userId.name}</p>
            <p><strong>Created At:</strong> {new Date(order.createdDate).toLocaleDateString()}</p>
            <p>
              <strong>Shipping Address:</strong>{' '}
              {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.country}
            </p>
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-2">Order Status</h3>
            <OrderStatusSteps currentStatus={order.status} />
        </div>
    </div>
);
}
