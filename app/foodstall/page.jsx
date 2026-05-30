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

          // FIX: Filter reservations by the room name in the attached 'room' object
          const filteredReservations = fetchedReservations.filter(reservation => reservation.room?.name === selectedRoom.name);
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-950">
        <div className="border-4 border-neutral-950 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest shadow-[6px_6px_0px_#000]">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 text-neutral-950">
        <div className="max-w-lg border-4 border-neutral-950 bg-white px-6 py-5 text-sm font-bold text-red-600 shadow-[6px_6px_0px_#000]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white">
      <div className="mx-auto w-full max-w-none px-2 sm:px-3 lg:px-4 py-4 sm:py-5 lg:py-6">
        <section className="relative overflow-hidden border-4 border-neutral-950 bg-white px-5 py-6 shadow-[8px_8px_0px_#000] sm:px-6 sm:py-8 mb-6">
          <div className="absolute top-0 left-0 h-3 w-24 bg-red-600" />
          <div className="absolute bottom-0 right-0 h-3 w-24 bg-red-600" />

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.45em] uppercase text-red-600 mb-3">
                Food Stall Dashboard
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-neutral-950 leading-none">
                {roomName || 'Food Stall'}
              </h1>
              <p className="mt-4 max-w-3xl text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
                Review sales, reservations, and lease status from a clean high-contrast stall workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center border-2 border-neutral-950 bg-neutral-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#dc2626]">
                Stall Live
              </span>
              {roomName && (
                <span className="inline-flex items-center border-2 border-neutral-950 bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#000]">
                  {roomName}
                </span>
              )}
            </div>
          </div>
        </section>

        <main className="space-y-4 min-w-0">
          <section className="border-4 border-neutral-950 bg-white p-3 shadow-[8px_8px_0px_#000] sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-[0.35em] uppercase text-red-600">
                  Sales Overview
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tighter uppercase text-neutral-950">
                  Stall Revenue
                </h2>
              </div>
              <span className="border-2 border-neutral-950 px-3 py-1 text-xs font-black uppercase tracking-widest text-neutral-950">
                Live Data
              </span>
            </div>

            {roomName ? (
              <SalesCard roomName={roomName} />
            ) : (
              <div className="border-2 border-dashed border-neutral-400 px-6 py-10 text-center text-sm font-bold uppercase tracking-widest text-neutral-500">
                No stall assigned yet.
              </div>
            )}
          </section>

          <section className="border-4 border-neutral-950 bg-white p-3 shadow-[8px_8px_0px_#000] sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-[0.35em] uppercase text-red-600">
                  Lease Status
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tighter uppercase text-neutral-950">
                  Reservation Timeline
                </h2>
              </div>
              <span className="border-2 border-neutral-950 px-3 py-1 text-xs font-black uppercase tracking-widest text-neutral-950">
                {reservations.length} Entries
              </span>
            </div>

            {reservations.length > 0 ? (
              <FoodStallLeaseCard reservations={reservations} />
            ) : (
              <div className="border-2 border-dashed border-neutral-400 px-6 py-10 text-center text-sm font-bold uppercase tracking-widest text-neutral-500">
                No reservations for this stall
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default FoodStallPage;