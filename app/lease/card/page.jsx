'use client';

import { useEffect, useState } from 'react';
import Heading from '@/components/Heading';
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
    <>
      <Heading 
        title="Stall Lease" 
        className="text-center mb-12 text-4xl font-bold text-gray-900 
                  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                  bg-clip-text text-transparent" 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-blue-500 
                        border-solid rounded-full"></div>
            <p className="mt-4 text-lg text-gray-500">Loading spaces...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <p className="mt-4 text-lg text-gray-500">
              No spaces available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <LeaseCard key={room.$id} room={room} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
