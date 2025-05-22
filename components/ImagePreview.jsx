'use client';

import { useEffect, useState } from "react";
import getAllSpaces from "@/app/actions/getAllSpaces";
import Link from "next/link";

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
          type: room.type?.join(" • ") || 'N/A',
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
    return <p className="text-center text-lg font-semibold text-gray-400">Loading...</p>;
  }

  if (rooms.length === 0) {
    return <p className="text-center text-lg font-semibold text-gray-400">No food stalls available.</p>;
  }

  return (
    <div className="w-full py-12 bg-stone-800">
      <div className="text-center mb-12 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">OUR STALLS</h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white">Explore the variety of food stalls.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        {rooms.map((room) => (
          <Link href={`/rooms/${room.id}`} key={room.id}>
            <div className="aspect-square bg-neutral-900 border border-pink-600 rounded-xl p-6 flex flex-col justify-center items-center text-center hover:bg-neutral-950 transition-all duration-300">
              
              {/* Decorative Line Above Title */}
              <div className="w-16 h-0.5 bg-pink-600 mb-6" /> {/* Shorter line with more spacing */}

              <h3 className="text-base font-bold text-white tracking-widest uppercase mb-4">
                {room.name}
              </h3>

              {/* Decorative Line Below Title */}
              <div className="w-16 h-0.5 bg-gray-600 mb-6" /> {/* Full width line with spacing */}

              <p className="text-gray-400 text-sm mb-2">
                <span className="font-semibold text-white">Type:</span> {room.type}
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold text-white">Stall:</span> {room.stallNumber}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
