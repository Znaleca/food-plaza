'use client';

import { useEffect, useState } from "react";
import Heading from "@/components/Heading";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa6";
import getSingleSpace from "@/app/actions/getSingleSpace";
import getAllStalls from "@/app/actions/getAllStalls";
import LeaseForm from "@/components/LeaseForm";
import { toast } from "react-toastify";
import updateStallNumber from "@/app/actions/updateStallNumber";

const LeaseSpace = () => {
  const { id } = useParams();
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
      <div className="flex min-h-screen items-center justify-center bg-white px-6 selection:bg-red-600 selection:text-white">
        <div className="flex flex-col items-center border-4 border-black bg-white px-10 py-10 shadow-[8px_8px_0px_#000]">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-black border-t-red-600" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-neutral-900">Loading Lease Space</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white">
        <div className="flex min-h-screen w-full flex-col items-center justify-center px-3 text-center md:px-6">
          <div className="w-full border-4 border-black bg-white p-8 shadow-[10px_10px_0px_#000] md:max-w-3xl md:p-10">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-red-600">Lease Module</p>
            <Heading title="Food Stall Not Found" />
            <p className="mt-4 text-neutral-700">The space you are looking for does not exist.</p>
            <Link
              href="/lease/card"
              className="mt-8 inline-flex items-center border-2 border-black bg-white px-5 py-3 text-sm font-black uppercase tracking-wider text-neutral-950 shadow-[4px_4px_0px_#000] transition-all duration-200 hover:bg-black hover:text-white hover:shadow-[2px_2px_0px_#000] hover:translate-y-[2px]"
            >
              <FaChevronLeft className="mr-2" />
              Go back to stall list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedStallNumber = parseInt(newStallNumber, 10);

  return (
    <div className="min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white">
      <div className="w-full px-2 py-5 md:px-4 md:py-8">
        <Link
          href="/lease/card"
          className="mb-6 inline-flex items-center border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] transition-all duration-200 hover:bg-black hover:text-white hover:shadow-[2px_2px_0px_#000] hover:translate-y-[2px]"
        >
          <FaChevronLeft className="mr-2 h-4 w-4" />
          Back to Stalls
        </Link>
        <section className="border-4 border-black bg-white px-6 py-8 shadow-[10px_10px_0px_#000] md:px-10 md:py-10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-red-600">Lease Details</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight leading-tight text-neutral-950 md:text-6xl">
                Stall #{room.stallNumber}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-neutral-700 md:text-base">Manage tenant assignment and update the stall number from one focused admin panel.</p>
            </div>
            <div className="inline-flex items-center gap-2 border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white">
              Active Lease Workspace
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000]">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">Current Occupant</p>
            <p className="mt-3 text-3xl font-black uppercase leading-tight text-neutral-950 md:text-4xl">
              {room.name || 'Vacant'}
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-700">Assigning a new lease will update this occupancy profile automatically.</p>
          </div>

          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000]">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">Selected Number</p>
            <p className="mt-3 text-5xl font-black text-neutral-950">{selectedStallNumber || room.stallNumber}</p>
            <p className="mt-2 text-sm font-medium text-neutral-700">Pick a number and confirm to update the assigned stall index.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="border-4 border-black bg-white p-6 shadow-[10px_10px_0px_#000] md:p-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-950">Manage Lease</h2>
            <p className="mt-2 text-sm font-medium text-neutral-700">Complete or update tenant information for this stall.</p>
            <div className="mt-5 border-2 border-black bg-neutral-100 p-2 md:p-4">
              <LeaseForm room={room} />
            </div>
          </section>

          <section className="border-4 border-black bg-white p-6 shadow-[10px_10px_0px_#000] md:p-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-950">Stall Number Picker</h2>
            <p className="mt-2 text-sm font-medium text-neutral-700">Unavailable numbers are locked. Your current stall remains selectable.</p>

            <form onSubmit={handleStallNumberChange} className="space-y-6">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => {
                  const taken = usedStalls.has(num) && num !== room.stallNumber; // allow current stall
                  const selected = selectedStallNumber === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => !taken && setNewStallNumber(num.toString())}
                      disabled={taken}
                      className={`flex h-14 items-center justify-center border-2 text-sm font-black transition-all duration-200
                        ${taken
                          ? 'cursor-not-allowed border-black bg-neutral-200 text-neutral-500'
                          : selected
                            ? 'border-black bg-red-600 text-white shadow-[3px_3px_0px_#000]'
                            : 'border-black bg-white text-black hover:bg-black hover:text-white'}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-neutral-800">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 border border-black bg-neutral-400" />
                  Taken
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 border border-black bg-red-600" />
                  Selected
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 border border-black bg-white" />
                  Available
                </span>
              </div>

              <input type="hidden" value={newStallNumber} readOnly />

              <button
                type="submit"
                className="w-full border-2 border-black bg-red-600 py-3 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[4px_4px_0px_#000] transition-all duration-200 hover:bg-black hover:shadow-[2px_2px_0px_#000] hover:translate-y-[2px]"
              >
                Update Number
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LeaseSpace;
