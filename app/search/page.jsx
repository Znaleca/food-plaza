'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getAllSpaces from "../actions/getAllSpaces";
import Image from "next/image";
import Link from "next/link";

const SearchResultPage = () => {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

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
    if (!searchInput) {
      setFilteredRooms(rooms.sort(() => 0.5 - Math.random()).slice(0, 6));
    } else {
      const filteredRoomsByQuery = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        room.menuName.some(menuItem =>
          menuItem.toLowerCase().includes(searchInput.toLowerCase())
        )
      );
      setFilteredRooms(filteredRoomsByQuery);
    }
  }, [searchInput, rooms]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value) {
      router.push(`/search?query=${encodeURIComponent(value)}`, { scroll: false });
    } else {
      router.push("/search", { scroll: false });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-neutral-900">
        <p className="text-white text-xl font-semibold animate-pulse">Loading food stalls...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white px-4 pt-32 pb-24">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-widest">
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            THE CORNER
          </span>
        </h1>
        <p className="mt-3 text-lg text-gray-300 tracking-wide">FOOD PLAZA</p>
      </div>

      {/* Search Bar */}
      <div className="mb-12 flex justify-center">
        <input
          type="text"
          placeholder="Search food stalls or menus..."
          value={searchInput}
          onChange={handleSearch}
          className="w-full max-w-xl p-4 text-lg bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
        {searchInput ? `Results for "${searchInput}"` : "Featured Food Stalls"}
      </h2>

      {/* Room Cards */}
      {filteredRooms.length === 0 ? (
        <p className="text-center text-xl text-gray-400 font-medium">
          No food stalls or menus found.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2 sm:px-6 mb-14">
            {filteredRooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`} passHref>
                <div className="group rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
                  <div className="relative w-full h-[230px]">
                    <Image
                      src={room.imageUrl}
                      alt={room.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white py-3 text-center">
                      <p className="text-lg font-semibold truncate">{room.name}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Menu Items */}
          {filteredRooms.some((room) => room.menuName.length > 0) && (
            <div className="px-4 sm:px-6">
              <h3 className="text-2xl font-bold mb-6 text-center">Matching Menu Items</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) =>
                  room.menuName.map((menuItem, index) =>
                    menuItem.toLowerCase().includes(searchInput.toLowerCase()) ? (
                      <Link key={`${room.id}-${index}`} href={`/rooms/${room.id}`} passHref>
                        <div className="p-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all cursor-pointer shadow">
                          <p className="italic text-base text-white">{menuItem}</p>
                          <p className="text-sm text-gray-300 mt-1">
                            Food Stall: <span className="font-semibold">{room.name}</span>
                          </p>
                        </div>
                      </Link>
                    ) : null
                  )
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultPage;
