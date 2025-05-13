"use client";

import { useEffect, useState } from "react";
import Heading from "@/components/Heading";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import getSingleSpace from "@/app/actions/getSingleSpace";
import CalendarView from "@/components/CalendarView";
import LeaseForm from "@/components/LeaseForm";

const LeaseSpace = ({ params }) => {
  const { id } = params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await getSingleSpace(id);
        setRoom(data);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!room) {
    return <Heading title="Food Stall Not Found" />;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 bg-gray-50">
      {/* Back Button */}
      <Link
        href="/lease/card"
        className="flex items-center text-blue-500 hover:text-blue-700 transition duration-300 mb-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back to Food Stalls</span>
      </Link>

      {/* Stall Heading */}
      <Heading 
        title={`Stall # ${room.stallNumber}`} 
        className="text-center text-4xl font-extrabold text-green-700 mb-8" 
      />

      {/* Content Card with Background */}
      <div 
        className="relative bg-cover bg-center shadow-xl rounded-xl border border-gray-300 transition-transform transform hover:scale-105 p-8"
        style={{ backgroundImage: "url('/images/card.jpg')" }}
      >
        {/* Overlay for Better Readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl"></div>

        {/* Content Inside */}
        <div className="relative z-10 text-white text-center p-6">
          <h2 className="text-3xl font-bold">Occupied by: {room.name}</h2>
        </div>
      </div>

      <LeaseForm room={room} />
      <CalendarView roomId={id} room={room} />

      
    </div>
  );
};

export default LeaseSpace;
