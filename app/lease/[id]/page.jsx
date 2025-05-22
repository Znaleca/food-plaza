'use client';

import { useEffect, useState } from "react";
import Heading from "@/components/Heading";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa6";
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
      <div className="flex justify-center items-center min-h-screen bg-neutral-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <Heading title="Food Stall Not Found" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white px-6 py-12">
      {/* Back Button */}
      <Link
        href="/lease/card"
        className="flex items-center text-yellow-400 hover:text-pink-400 transition duration-300 mb-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      {/* Stall Heading */}
      <div className="text-center mb-10">
        <h2 className="text-yellow-500 uppercase text-sm tracking-widest">Lease</h2>
        <h1 className="text-4xl font-bold mt-2">Stall #{room.stallNumber}</h1>
      </div>

      {/* Occupant Info */}
      <div className="bg-neutral-800 border border-pink-500 rounded-xl p-6 mb-10 text-center shadow-lg">
        <h2 className="text-2xl font-semibold text-white">
          Occupied by: <span className="text-pink-400">{room.name}</span>
        </h2>
      </div>

      {/* Lease Form */}
      <div className="mb-10">
        <LeaseForm room={room} />
      </div>

      
    </div>
  );
};

export default LeaseSpace;
