'use client';

import React, { startTransition, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import createStall from '@/app/actions/createStall';
import getStallUser from '@/app/actions/getStallUser';
import getAllStalls from '@/app/actions/getAllStalls';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';

function AddStallPage() {
  const [state, formAction] = React.useActionState(createStall, {});
  const [foodstallUsers, setFoodstallUsers] = useState([]);
  const [stallNumber, setStallNumber] = useState('');
  const [stallName, setStallName] = useState('');
  const [usedStalls, setUsedStalls] = useState(new Set());
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [users, stalls] = await Promise.all([
          getStallUser(),
          getAllStalls(),
        ]);

        // Filter users without stalls
        const usersWithStalls = new Set(stalls.map(stall => stall.user_id));
        const filteredUsers = users.filter(user => !usersWithStalls.has(user.$id));
        setFoodstallUsers(filteredUsers);

        // Mark used stalls
        const taken = new Set(stalls.map(stall => parseInt(stall.stallNumber, 10)));
        setUsedStalls(taken);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success('Food Stall added successfully!');
      router.push('/admin');
    }
  }, [state, router]);

  // Update stall name whenever stallNumber changes
  useEffect(() => {
    setStallName(stallNumber ? `Food Stall ${stallNumber}` : '');
  }, [stallNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <Link
          href="/admin"
          className="inline-flex items-center border-2 border-neutral-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-950 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:bg-neutral-950 hover:text-white"
        >
          <FaChevronLeft className="mr-2" />
          Back
        </Link>

        <section className="relative mt-6 mb-8 overflow-hidden border-4 border-neutral-950 bg-white px-6 py-8 shadow-[8px_8px_0px_#000] sm:px-8 sm:py-10">
          <div className="absolute top-0 left-0 h-3 w-24 bg-red-600" />
          <div className="absolute bottom-0 right-0 h-3 w-24 bg-red-600" />
          <p className="text-xs font-black tracking-[0.45em] uppercase text-red-600 mb-3">
            Admin Module
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-neutral-950 leading-none">
            Add a Food Stall
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
            Assign a food stall owner, choose an open stall number, and save the stall record in the same bold dashboard style.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6 border-4 border-neutral-950 bg-white p-6 shadow-[8px_8px_0px_#000] sm:p-8">
          {/* dropdown for selecting foodstall user */}
          <div>
            <label htmlFor="user_id" className="block text-xs font-black tracking-[0.35em] uppercase text-neutral-500 mb-3">Select Foodstall User</label>
            <select
              id="user_id"
              name="user_id"
              required
              className="w-full border-2 border-neutral-950 bg-white px-4 py-3 font-bold text-neutral-950 outline-none transition-colors focus:border-red-600"
            >
              <option value="">-- Select a Foodstall Owner --</option>
              {foodstallUsers.map((user) => (
                <option key={user.$id} value={user.$id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* stall number cinema-style picker */}
          <div>
            <label className="block text-xs font-black tracking-[0.35em] uppercase text-neutral-500 mb-4">Choose Stall #</label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
              {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => {
                const taken = usedStalls.has(num);
                const selected = parseInt(stallNumber, 10) === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => !taken && setStallNumber(num)}
                    disabled={taken}
                    className={`h-14 w-full border-2 border-neutral-950 font-black transition-all ${
                      taken
                        ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                        : selected
                          ? 'bg-red-600 text-white shadow-[4px_4px_0px_#000]'
                          : 'bg-white text-neutral-950 shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:bg-neutral-950 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="stallNumber" value={stallNumber} required />
          </div>

          {/* stall name (auto-filled) */}
          <div>
            <label className="block text-xs font-black tracking-[0.35em] uppercase text-neutral-500 mb-3">Food Stall Name</label>
            <input
              type="text"
              name="name"
              value={stallName}
              onChange={(e) => setStallName(e.target.value)}
              required
              className="w-full border-2 border-neutral-950 bg-white px-4 py-3 font-bold text-neutral-950 outline-none transition-colors focus:border-red-600"
            />
          </div>

          {/* description (auto-filled but editable) */}
          <div>
            <label className="block text-xs font-black tracking-[0.35em] uppercase text-neutral-500 mb-3">Description</label>
            <textarea
              name="description"
              defaultValue="Welcome to The Corner Food Plaza! We’re excited to have you join our growing community of food entrepreneurs. Please take this opportunity to design and personalize your very own food stall, showcasing your brand, style, and culinary vision. This will help create a unique space that truly represents your business and attracts customers. (DELETE THIS AFTER READING)"
              required
              className="h-40 w-full border-2 border-neutral-950 bg-white px-4 py-3 font-medium text-neutral-950 outline-none transition-colors focus:border-red-600"
            />
          </div>

          {/* submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="border-2 border-neutral-950 bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:bg-neutral-950"
            >
              Save Food Stall
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStallPage;