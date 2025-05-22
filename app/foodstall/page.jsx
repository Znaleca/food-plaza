'use client';

import { useEffect, useState } from 'react';
import getAllOrders from '@/app/actions/getAllOrders';
import getMySpaces from '@/app/actions/getMySpaces';
import SalesCard from '@/components/SalesCard'; 

const FoodStallPage = () => {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const spaces = await getMySpaces();
        if (spaces.length > 0) {
          const selectedRoom = spaces[0];
          setRoomName(selectedRoom.name);
          setRoomId(selectedRoom.$id);

          await getAllOrders(1, 100); // preload orders if needed
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      {/* New header style */}
      <div className="mt-12 sm:mt-16 text-center mb-8 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">
          Food Stall
        </h2>
        <p className="mt-4 text-2xl sm:text-5xl mb-28 font-extrabold text-white leading-tight">
          {roomName}
        </p>
      </div>

      {/* Insert SalesCard here, passing the roomName */}
      {roomName && <SalesCard roomName={roomName} />}
    </div>
  );
};

export default FoodStallPage;
