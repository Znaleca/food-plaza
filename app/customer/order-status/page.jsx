'use client';

import { useEffect, useState } from 'react';
import getUserOrders from '@/app/actions/getUserOrders';
import OrderCard from '@/components/OrderCard';
import LoadingSpinner from '@/components/LoadingSpinner'; // <-- import here

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
    <div className="w-full -mt-20 min-h-screen bg-neutral-950 text-white">
      <section className="w-full py-32 px-4 sm:px-6">
        <div className="text-center mb-12">
        <header className="text-center mb-28 mt-12 sm:mt-16 px-4">
        <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          MY ORDERS
        </h2>
        <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
        Track and rate{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          your meals.          </span>
        </p>
      </header>
         
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your orders..." />
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
