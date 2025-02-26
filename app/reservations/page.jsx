'use client';

import { useEffect, useState } from 'react';
import getAllReservations from '../actions/getAllReservations';
import BookedRoomCard from '@/components/BookedRoomCard';

const PreviewReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getAllReservations();
        if (data.error) {
          throw new Error(data.error);
        }
        setReservations(data);
      } catch (error) {
        setError('Failed to load reservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Reservations</h1>
      {reservations.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <div>
          {reservations.map((booking) => (
            <BookedRoomCard key={booking.$id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviewReservationPage;
