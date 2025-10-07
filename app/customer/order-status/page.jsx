'use client';

import { useEffect, useState } from 'react';
import { Client } from 'appwrite';
import getUserOrders from '@/app/actions/getUserOrders';
import OrderCard from '@/components/OrderCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const OrderStatusPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    loadOrders(); // initial load

    // 🟣 Setup Appwrite client for realtime updates
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

    // Subscribe to the order-status collection
    const unsubscribe = client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE}.collections.${process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS}.documents`,
      async (response) => {
        console.log('Realtime update:', response);
        // Just reload orders when anything changes
        await loadOrders();
      }
    );

    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="w-full -mt-20 min-h-screen bg-neutral-950 text-white">
      <section className="w-full py-32 px-4 sm:px-6">
        <header className="text-center mb-28 mt-12 sm:mt-16 px-4">
          <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            MY ORDERS
          </h2>
          <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Track and rate{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              your meals.
            </span>
          </p>
        </header>

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
