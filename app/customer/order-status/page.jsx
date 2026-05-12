'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Client } from 'appwrite';
import getUserOrders from '@/app/actions/getUserOrders';
import OrderCard from '@/components/OrderCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaArrowRight } from 'react-icons/fa6';

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
    loadOrders();

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

    const unsubscribe = client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE}.collections.${process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS}.documents`,
      async (response) => {
        console.log('Realtime update:', response);
        await loadOrders();
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-neutral-950 font-sans selection:bg-red-600 selection:text-white pb-20">
      
      {/* ── HEADER ── */}
      <section className="w-full border-b-[8px] border-neutral-950 pt-32 pb-16 px-6 md:px-20 relative overflow-hidden bg-neutral-50">
        {/* Background accent line */}
        <div className="absolute top-0 left-0 w-full h-4 bg-red-600"></div>
        <div className="absolute top-0 left-12 w-4 h-full bg-red-600 opacity-20 hidden md:block"></div>

        <div className="relative z-10">
          <span className="text-xs font-black tracking-[0.4em] uppercase text-red-600 block mb-4">
            ORDER_STATUS
          </span>
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8 max-w-4xl">
            ACTIVE<br/>TRACKING
          </h2>

          {/* History Link */}
          <Link
            href="/customer/order-history"
            className="inline-flex items-center gap-3 py-4 px-8 border-4 border-neutral-950 bg-white font-black text-sm uppercase tracking-[0.2em] hover:bg-neutral-950 hover:text-white transition-colors duration-200"
          >
            HISTORY & REVIEWS <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* ── BODY ── */}
      <section className="px-6 md:px-20 mt-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner message="SYNCING ORDERS..." />
          </div>
        ) : error ? (
          <div className="border-l-8 border-red-600 bg-red-50 p-6 max-w-2xl">
            <p className="text-xl font-black uppercase tracking-tight text-red-600">SYSTEM ERROR</p>
            <p className="font-bold text-neutral-600 mt-1">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="border-4 border-dashed border-neutral-300 bg-neutral-50 py-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-neutral-200 flex items-center justify-center mb-6">
              <span className="font-black text-neutral-400 text-2xl">Ø</span>
            </div>
            <p className="text-2xl font-black uppercase tracking-tighter mb-2">NO ACTIVE ORDERS</p>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
              Check history for completed requests.
            </p>
          </div>
        ) : (
          <div className="space-y-12 max-w-5xl mx-auto">
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