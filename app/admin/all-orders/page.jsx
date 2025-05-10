'use client';

import { useEffect, useState } from 'react';
import getAllOrders from '@/app/actions/getAllOrders';
import getMySpaces from '@/app/actions/getMySpaces'; 
import AllOrdersCard from '@/components/AllOrdersCard';
import Heading from '@/components/Heading';

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [roomName, setRoomName] = useState('');
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

      const spaces = await getMySpaces();
      if (spaces.length > 0) {
        setRoomName(spaces[0].name); // If you only allow one room per user
      }
    } catch (error) {
      console.error('Could not load orders or room:', error);
      setError('Could not load orders or room info');
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
        <Heading title=" All Orders"/>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <AllOrdersCard
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
