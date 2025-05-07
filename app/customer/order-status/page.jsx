'use client';

import { useEffect, useState } from 'react';
import getUserOrders from '@/app/actions/getUserOrders';
import Heading from '@/components/Heading';
import OrderCard from '@/components/OrderCard';

const OrderStatusPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getUserOrders();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        console.error('Could not load orders:', error);
        setError('Could not load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <Heading title="My Orders" />

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.$id} order={order} setOrders={setOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusPage;
