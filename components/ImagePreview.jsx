'use client';

import { useEffect, useState } from "react";
import getAllSpaces from "@/app/actions/getAllSpaces";
import Link from "next/link";
import { FaStore } from 'react-icons/fa'; // Added for a modern touch

const ImagePreview = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await getAllSpaces();

        const formattedRooms = fetchedRooms.map((room) => ({
          id: room.$id,
          name: room.name,
          stallNumber: room.stallNumber || 'N/A',
        }));

        setRooms(formattedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return <p className="text-center text-lg font-semibold text-gray-400 py-12 bg-stone-800 min-h-screen">Loading...</p>;
  }

  if (rooms.length === 0) {
    return <p className="text-center text-lg font-semibold text-gray-400 py-12 bg-stone-800 min-h-screen">No food stalls available.</p>;
  }

  return (
    <div className="w-full py-20 bg-stone-800">
      <div className="text-center mb-16 px-4">
        <h2 className="text-base sm:text-lg text-pink-600 font-medium tracking-widest uppercase">Our Stalls</h2>
        <p className="mt-4 text-3xl sm:text-5xl font-extrabold text-white">Explore the variety of food stalls.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-8 max-w-7xl mx-auto">
        {rooms.map((room) => (
          <Link href={`/rooms/${room.id}`} key={room.id}>
            <div className="group relative aspect-square bg-neutral-900 border border-neutral-700 rounded-2xl p-8 flex flex-col justify-between items-center text-center transition-all duration-300 transform hover:scale-105 hover:bg-neutral-950 hover:border-pink-600 shadow-lg">
              
              {/* Decorative Header */}
              <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center">
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaStore />
                </div>
                <div className="w-16 h-0.5 bg-pink-600 group-hover:w-20 transition-all duration-500" />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center items-center">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide uppercase transition-all duration-300 group-hover:text-pink-600">
                  {room.name}
                </h3>
              </div>

              {/* Stall Number in a bigger circle */}
              <div className="w-16 h-16 rounded-full bg-pink-600 group-hover:bg-pink-700 text-white flex items-center justify-center text-2xl font-extrabold shadow-xl transition-colors duration-300">
                {room.stallNumber}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;