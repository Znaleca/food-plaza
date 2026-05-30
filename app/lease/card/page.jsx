'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';
import LeaseCard from '@/components/LeaseCard';
import getAllSpaces from '@/app/actions/getAllSpaces';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getAllSpaces();
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-white px-2 py-5 text-neutral-950 selection:bg-red-600 selection:text-white md:px-4 md:py-8">
      <Link
        href="/lease/management"
        className="mb-6 inline-flex items-center border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] transition-all duration-200 hover:translate-y-[2px] hover:bg-black hover:text-white hover:shadow-[2px_2px_0px_#000]"
      >
        <FaChevronLeft className="mr-2" />
        Back
      </Link>

      <section className="border-4 border-black bg-white px-5 py-8 shadow-[10px_10px_0px_#000] md:px-8 md:py-10">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-red-600">Lease Module</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">Available Food Stalls</h1>
            <p className="mt-3 text-sm font-medium text-neutral-700 md:text-base">Choose a stall to inspect details, assign a tenant, or update lease records.</p>
          </div>
          <div className="inline-flex items-center border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
            {rooms.length} Stalls
          </div>
        </div>
      </section>

      {loading ? (
        <div className="mt-6 flex h-80 flex-col items-center justify-center border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">
          <div className="h-12 w-12 animate-spin border-4 border-black border-t-red-600" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-neutral-800">Loading Stalls</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="mt-6 border-4 border-black bg-white p-10 text-center shadow-[8px_8px_0px_#000]">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">No Spaces Available</p>
          <p className="mt-3 text-sm font-medium text-neutral-700">No lease spaces are available right now. Please check back later.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <LeaseCard key={room.$id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
