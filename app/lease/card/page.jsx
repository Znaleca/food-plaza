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
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      {/* Back Button */}
      <Link
        href="/admin"
        className="flex items-center text-yellow-400 hover:text-pink-400 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-yellow-500 uppercase text-sm tracking-widest">Lease</h2>
        <h1 className="text-4xl font-bold mt-2">Available Food Stalls</h1>
      </div>

      {/* Room Cards */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-yellow-400 border-solid rounded-full"></div>
            <p className="mt-4 text-lg text-gray-400">Loading spaces...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <p className="mt-4 text-lg text-gray-400">
              No spaces available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <LeaseCard key={room.$id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
