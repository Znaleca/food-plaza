'use client';

import { useEffect, useState } from 'react';
import getAllOrders from '@/app/actions/getAllOrders';
import OrderReceiveCard from '@/components/OrderReceiveCard'; // <-- adjust path as needed

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All Orders</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderReceiveCard
                key={order.$id}
                order={order}
                refreshOrders={loadOrders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrdersPage;
