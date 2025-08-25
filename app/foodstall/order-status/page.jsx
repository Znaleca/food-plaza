'use client';

import { useEffect, useState } from 'react';
import getAllOrders from '@/app/actions/getAllOrders';
import OrderReceiveCard from '@/components/OrderReceiveCard';
import getMySpaces from '@/app/actions/getMySpaces';

const MyOrdersPage = () => {
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
        setRoomName(spaces[0].name); // Only use the first space name
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

  const filteredOrders = orders.filter(order =>
    order.items.some(itemString => {
      try {
        const item = JSON.parse(itemString);
        return item.room_name === roomName;
      } catch {
        return false;
      }
    })
  );

  return (
    <div className="min-h-screen text-white px-4 py-10">
      <div className="max-w-6xl mx-auto bg-neutral-900 text-white shadow-xl border-2 border-pink-600 rounded-2xl p-8">
        {/* Header style like FoodStallPage */}
        <div className="text-center mb-12">
          <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">
            Orders
          </h2>
          <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">
            {roomName}
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-gray-400 text-center">No orders found for this room.</p>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderReceiveCard
                key={order.$id}
                order={order}
                roomName={roomName}
                refreshOrders={loadOrders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
