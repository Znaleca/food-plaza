'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import getAllSpaces from "@/app/actions/getAllSpaces";
import Image from "next/image";
import Link from "next/link";

const SearchResultPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("query") || "";
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery); // Controlled input

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await getAllSpaces();
        const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

        const formattedRooms = fetchedRooms.map((room) => ({
          id: room.$id,
          name: room.name,
          menuName: room.menuName || [],
          imageUrl:
            room.images?.length > 0
              ? `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${room.images[0]}/view?project=${projectId}`
              : "/placeholder.jpg",
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

  useEffect(() => {
    if (!searchQuery) {
      setFilteredRooms(rooms.sort(() => 0.5 - Math.random()).slice(0, 6));
    } else {
      const filteredRoomsByQuery = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.menuName.some(menuItem => menuItem.toLowerCase().includes(searchQuery.toLowerCase())) // Filter by menu name
      );
      setFilteredRooms(filteredRoomsByQuery);
    }
  }, [searchQuery, rooms]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    router.push(value ? `/search?query=${value}` : "/search");
  };

  if (loading) {
    return <p className="text-center text-lg font-semibold">Loading food stalls...</p>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 px-4">
      {/* White background container */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search food stalls or menus..."
            value={searchInput}
            onChange={handleSearch}
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-yellow-400 focus:outline-none"
          />
        </div>

        <h2 className="text-3xl font-bold text-center mb-6">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Explore Food Stalls"}
        </h2>

        {filteredRooms.length === 0 ? (
          <p className="text-center text-lg font-semibold">No food stalls or menus found.</p>
        ) : (
          <>
            {/* Food Stalls Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              {filteredRooms.map((room) => (
                <div key={room.id} className="p-4 border rounded-lg shadow-lg bg-white">
                  <Link href={`/rooms/${room.id}`} passHref>
                    <div className="relative cursor-pointer rounded-lg overflow-hidden shadow-lg group">
                      <Image
                        src={room.imageUrl}
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

            {/* Menu Items Section */}
            {filteredRooms.some((room) => room.menuName.length > 0) && (
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-4">Menu Items</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredRooms.map((room) =>
                    room.menuName.map(
                      (menuItem, index) =>
                        menuItem.toLowerCase().includes(searchQuery.toLowerCase()) && (
                          <Link key={`${room.id}-${index}`} href={`/rooms/${room.id}`} passHref>
                            <div className="border p-4 rounded-lg shadow-md bg-gray-100 cursor-pointer hover:bg-gray-200">
                              <p className="italic text-sm">{menuItem}</p>
                              <p className="text-sm text-gray-500">Food Stall: {room.name}</p>
                            </div>
                          </Link>
                        )
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultPage;