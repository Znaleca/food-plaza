'use client';

import { useEffect, useState } from 'react';
import getUserOrders from '@/app/actions/getUserOrders';
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
    <div className="w-full min-h-screen bg-neutral-900 text-white">
      <section className="w-full py-32 px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">MY ORDERS</h2>
          <p className="mt-4 text-xl sm:text-5xl font-bold">Track and rate your meals.</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 text-center">No orders found.</p>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <OrderCard key={order.$id} order={order} setOrders={setOrders} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OrderStatusPage;
