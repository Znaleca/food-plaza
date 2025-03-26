'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getAllSpaces from '@/app/actions/getAllSpaces';
import Image from 'next/image';
import Link from 'next/link';

const SearchResultPage = () => {
  const router = useRouter();
  const searchQuery = router?.query?.query || '';
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await getAllSpaces();
        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredRooms(rooms);
    } else {
      setFilteredRooms(
        rooms.filter((room) =>
          room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.menuName?.some((menu) => menu.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    }
  }, [searchQuery, rooms]);

  if (loading) {
    return <p className="text-center text-lg font-semibold">Loading food stalls...</p>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-3xl font-bold text-center mb-6">
        {searchQuery ? `Search Results for "${searchQuery}"` : "Explore Food Stalls"}
      </h2>
      {filteredRooms.length === 0 ? (
        <p className="text-center text-lg font-semibold">No food stalls or menus found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {filteredRooms.map((room) => (
            <div key={room.$id} className="p-4 border rounded-lg shadow-lg bg-white">
              <Link href={`/rooms/${room.$id}`} passHref>
                <div className="relative cursor-pointer rounded-lg overflow-hidden shadow-lg group">
                  <Image
                    src={room.images?.[0] || '/placeholder.jpg'}
                    alt={room.name}
                    width={400}
                    height={300}
                    className="w-full h-[250px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 bg-black bg-opacity-50 text-white p-3 w-full text-center">
                    <p className="text-lg font-bold">{room.name}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultPage;
