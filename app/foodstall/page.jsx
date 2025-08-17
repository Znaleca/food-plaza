'use client';

import { useEffect, useState } from 'react';
import getAllReservations from '@/app/actions/getAllReservations';
import getAllOrders from '@/app/actions/getAllOrders';
import getMySpaces from '@/app/actions/getMySpaces';
import SalesCard from '@/components/SalesCard';
import FoodStallLeaseCard from '@/components/FoodStallLeaseCard';

const FoodStallPage = () => {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [reservations, setReservations] = useState([]);
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

          // Fetch all reservations
          const fetchedReservations = await getAllReservations();

          // Filter reservations by the selected room name
          const filteredReservations = fetchedReservations.filter(reservation => reservation.room_id?.name === selectedRoom.name);
          setReservations(filteredReservations);

          await getAllOrders(1, 100);
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

      {/* FoodStallLeaseCard with filtered reservations */}
      {reservations.length > 0 ? (
        <FoodStallLeaseCard reservations={reservations} />
      ) : (
        <div className="text-white text-center">No reservations for this stall</div>
      )}
    </div>
  );
};

export default FoodStallPage;
