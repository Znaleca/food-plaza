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
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!room) {
    return <Heading title="Food Stall Not Found" />;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 bg-white">
      {/* Back Button */}
      <Link
        href="/lease/card"
        className="flex items-center text-gray-600 hover:text-black transition mb-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-base">Back to Food Stalls</span>
      </Link>

      {/* Stall Heading */}
      <Heading 
        title={`Stall #${room.stallNumber || "N/A"}`} 
        className="text-center text-3xl font-semibold text-gray-800 mb-4" 
      />

      {/* Occupied By Card */}
      <div className="bg-gray-100 rounded-xl p-6 mb-10 text-center shadow-sm">
        <h2 className="text-xl text-gray-700 font-medium">Currently Occupied By:</h2>
        <p className="text-2xl text-blue-600 font-bold mt-2">{room.name}</p>
      </div>

      {/* Calendar View */}
      <div className="mb-10">
        <CalendarView roomId={id} room={room} />
      </div>

      {/* Lease Form */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
        <LeaseForm room={room} />
      </div>
    </div>
  );
};

export default LeaseSpace;
