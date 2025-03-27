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
    return <p className="text-center text-lg font-semibold text-gray-400">Loading food stalls...</p>;
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
    <div className="relative w-full max-w-5xl mx-auto mt-12 px-6">
      <Link href={`/rooms/${currentRoom.id}`} passHref>
        <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-2xl border border-gray-700">
          {/* Image with Fade Effect */}
          <div className="relative w-full h-[500px] overflow-hidden">
            {rooms.map((room, index) => (
              <Image
                key={room.id}
                src={room.imageUrl}
                alt={room.name}
                width={1600}
                height={800}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>

          {/* Text & Button */}
          <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-3xl font-extrabold">{currentRoom.name}</h2>
            <button className="mt-4 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full shadow-lg hover:bg-yellow-400 transition-transform transform hover:scale-105">
              View Food Stall
            </button>
          </div>
        </div>
      </Link>

      {/* Navigation Buttons */}
      <button
        onClick={handleBack}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/70 text-white p-4 rounded-full shadow-lg hover:bg-black/90 transition-all duration-300 hover:scale-110"
      >
        ◀
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/70 text-white p-4 rounded-full shadow-lg hover:bg-black/90 transition-all duration-300 hover:scale-110"
      >
        ▶
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-6">
        {rooms.map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 mx-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-yellow-500 scale-125 shadow-lg" : "bg-gray-500 opacity-70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
