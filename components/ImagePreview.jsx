'use client';

import { useEffect, useState } from "react";
import getAllSpaces from "@/app/actions/getAllSpaces";
import Image from "next/image";
import Link from "next/link";

const ImagePreview = () => {
  const [rooms, setRooms] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isManual, setIsManual] = useState(false); // Track manual navigation

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await getAllSpaces();
        const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

        const formattedRooms = fetchedRooms.map((room) => ({
          id: room.$id,
          name: room.name,
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
    if (rooms.length === 0 || isManual) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % rooms.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [rooms, isManual]);

  useEffect(() => {
    if (!isManual) return;

    const resetTimer = setTimeout(() => {
      setIsManual(false);
    }, 10000); // Reset auto-slide after 10 seconds

    return () => clearTimeout(resetTimer);
  }, [isManual]);

  if (loading) {
    return <p className="text-center text-lg font-semibold">Loading food stalls...</p>;
  }

  if (rooms.length === 0) {
    return <p className="text-center text-lg font-semibold">No food stalls available.</p>;
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
    <div className="w-full max-w-5xl mx-auto mt-10 px-4 relative">
      <Link href={`/rooms/${currentRoom.id}`} passHref>
        <div className="relative group cursor-pointer rounded-lg overflow-hidden shadow-xl">
          {/* Large Image */}
          <Image
            src={currentRoom.imageUrl}
            alt={currentRoom.name}
            width={1600}
            height={800}
            className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>

          {/* Text & Button */}
          <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-3xl font-bold">{currentRoom.name}</h2>
            <button className="mt-4 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full shadow-md hover:bg-yellow-400 transition">
              View Food Stall
            </button>
          </div>
        </div>
      </Link>

      {/* Navigation Buttons */}
      <button
        onClick={handleBack}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full shadow-lg hover:bg-black/70"
      >
        ◀
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full shadow-lg hover:bg-black/70"
      >
        ▶
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-4">
        {rooms.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 mx-1 rounded-full ${
              index === currentIndex ? "bg-yellow-500 scale-125" : "bg-gray-400"
            } transition-all duration-300`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
