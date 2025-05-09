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

  // Filter orders that contain at least one item for this room
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
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {roomName ? `${roomName} | ORDER(S)` : 'ORDER(S)'}
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-gray-600">No orders found for this room.</p>
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
