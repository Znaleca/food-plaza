'use client';

import { useEffect, useState } from "react";
import getAllSpaces from "@/app/actions/getAllSpaces";
import Image from "next/image";
import Link from "next/link";

const ImagePreview = () => {
  const [rooms, setRooms] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await getAllSpaces();
        const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

        const formattedRooms = fetchedRooms.map((room) => ({
          id: room.$id,
          name: room.name,
          imageUrl: room.images?.length > 0
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
    if (rooms.length === 0 || isManual) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % rooms.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [rooms, isManual]);

  useEffect(() => {
    if (!isManual) return;

    const resetTimer = setTimeout(() => {
      setIsManual(false);
    }, 10000);

    return () => clearTimeout(resetTimer);
  }, [isManual]);

  if (loading) {
    return <p className="text-center text-lg font-semibold text-gray-400">Loading...</p>;
  }

  if (rooms.length === 0) {
    return <p className="text-center text-lg font-semibold text-gray-400">No food stalls available.</p>;
  }

  const handleNext = () => {
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % rooms.length);
  };

  const handleBack = () => {
    setIsManual(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + rooms.length) % rooms.length);
  };

  const currentRoom = rooms[currentIndex];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg border-2 border-pink-600">
      <Link href={`/rooms/${currentRoom.id}`} passHref>
        <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-xl transition-transform duration-500">
          {/* Image with Fade Effect */}
          <div className="relative w-full h-[500px] overflow-hidden rounded-xl p-4">
            {rooms.map((room, index) => (
              <Image
                key={room.id}
                src={room.imageUrl}
                alt={room.name}
                width={1400}  // Reduced the width of the image
                height={750}  // Reduced the height of the image
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 rounded-xl"></div>

          {/* Text & Button */}
          <div className="absolute bottom-8 left-8 text-white z-10">
            <h2 className="text-3xl md:text-4xl font-bold">{currentRoom.name}</h2>
            <button className="mt-4 px-8 py-4 bg-black text-white font-semibold text-xl rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105">
  Explore
</button>

          </div>
        </div>
      </Link>

     

      {/* Pagination Dots */}
      <div className="flex justify-center mt-6">
        {rooms.map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 mx-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-yellow-500 opacity-100" : "bg-gray-400 opacity-80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
