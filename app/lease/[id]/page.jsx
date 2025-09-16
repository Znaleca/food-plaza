'use client';

import { useEffect, useState } from "react";
import Heading from "@/components/Heading";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa6";
import getSingleSpace from "@/app/actions/getSingleSpace";
import getAllStalls from "@/app/actions/getAllStalls";
import LeaseForm from "@/components/LeaseForm";
import { toast } from "react-toastify";
import updateStallNumber from "@/app/actions/updateStallNumber";

const LeaseSpace = ({ params }) => {
  const { id } = params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStallNumber, setNewStallNumber] = useState('');
  const [usedStalls, setUsedStalls] = useState(new Set());

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const [data, stalls] = await Promise.all([
          getSingleSpace(id),
          getAllStalls(),
        ]);

        if (data) {
          setRoom(data);
          setNewStallNumber(data.stallNumber.toString());
        }

        // Mark taken stalls
        const taken = new Set(stalls.map(stall => parseInt(stall.stallNumber, 10)));
        setUsedStalls(taken);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleStallNumberChange = async (e) => {
    e.preventDefault();
    if (newStallNumber === room.stallNumber.toString()) {
      return;
    }

    const formData = new FormData();
    formData.append('id', id);
    formData.append('stallNumber', newStallNumber);

    const result = await updateStallNumber(null, formData);

    if (result.success) {
      toast.success('Stall number updated successfully!');
      setRoom(prevRoom => ({ ...prevRoom, stallNumber: parseInt(newStallNumber) }));
    } else {
      toast.error('Error updating stall number.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8 text-center">
        <Heading title="Food Stall Not Found" />
        <p className="mt-4 text-neutral-400">The space you are looking for does not exist.</p>
        <Link
          href="/lease/card"
          className="mt-6 text-yellow-400 hover:text-pink-500 transition-colors duration-300 font-medium flex items-center"
        >
          <FaChevronLeft className="mr-2" />
          Go back to stall list
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-4 md:px-8 py-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/lease/card"
          className="flex items-center text-yellow-400 hover:text-pink-500 transition-colors duration-300 mb-8"
        >
          <FaChevronLeft className="mr-2 h-5 w-5" />
          <span className="font-semibold text-lg">Back to Stalls</span>
        </Link>

        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-white uppercase text-sm tracking-widest font-light">Lease Details</p>
          <h1 className="text-5xl md:text-6xl font-extrabold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
            Stall #{room.stallNumber}
          </h1>
        </div>

        {/* Occupant Info Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl transition-all duration-300 transform hover:scale-105 hover:border-pink-500">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-2 md:mb-0">
              Current Occupant
            </h2>
            <p className="text-2xl md:text-3xl font-extrabold text-yellow-400">
              {room.name || 'Vacant'}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Update Stall Number Cinema Picker */}
          <div className="bg-neutral-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-800">
            <h2 className="text-2xl font-bold mb-6 text-white">Stall Number</h2>
            <form onSubmit={handleStallNumberChange} className="space-y-6">
              <div className="grid grid-cols-5 gap-4 justify-items-center">
                {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => {
                  const taken = usedStalls.has(num) && num !== room.stallNumber; // allow current stall
                  const selected = parseInt(newStallNumber, 10) === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => !taken && setNewStallNumber(num.toString())}
                      disabled={taken}
                      className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold transition-all
                        ${taken
                          ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                          : selected
                            ? 'bg-pink-600 text-white shadow-lg scale-110'
                            : 'bg-neutral-800 hover:bg-pink-700 text-white'}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" value={newStallNumber} readOnly />

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-lg font-bold text-white shadow-lg transform transition-all duration-300 hover:from-yellow-500 hover:to-pink-400 hover:scale-105"
              >
                Update Number
              </button>
            </form>
          </div>

          {/* Lease Form */}
          <div className="bg-neutral-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-800">
            <h2 className="text-2xl font-bold mb-6 text-white">Manage Lease</h2>
            <LeaseForm room={room} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaseSpace;
