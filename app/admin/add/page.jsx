'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import createStall from '@/app/actions/createStall';
import getStallUser from '@/app/actions/getStallUser';
import getAllStalls from '@/app/actions/getAllStalls';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';

function AddStallPage() {
  const [state, formAction] = useFormState(createStall, {});
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
    formAction(fd);
  };

  return (
    <div className="bg-neutral-900 min-h-screen text-white p-6">
      <Link
        href="/admin"
        className="flex items-center text-white hover:text-pink-500 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      <div className="text-center mb-8 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">
          Add Stall
        </h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold leading-tight">
          Add a Food Stall
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {/* dropdown for selecting foodstall user */}
        <div>
          <label htmlFor="user_id" className="block font-semibold mb-2">Select Foodstall User</label>
          <select
            id="user_id"
            name="user_id"
            required
            className="bg-neutral-800 border border-neutral-700 rounded-lg w-full py-3 px-6"
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
          <label className="block font-semibold mb-4">Choose Stall #</label>
          <div className="grid grid-cols-5 gap-4 justify-items-center">
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => {
              const taken = usedStalls.has(num);
              const selected = parseInt(stallNumber, 10) === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => !taken && setStallNumber(num)}
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
          {/* hidden input to pass stallNumber to form */}
          <input type="hidden" name="stallNumber" value={stallNumber} required />
        </div>

        {/* stall name (auto-filled) */}
        <div>
          <label className="block font-semibold mb-2">Food Stall Name</label>
          <input
            type="text"
            name="name"
            value={stallName}
            onChange={(e) => setStallName(e.target.value)}
            required
            className="bg-neutral-800 border border-neutral-700 rounded-lg w-full py-3 px-6 text-white"
          />
        </div>

        {/* description (auto-filled but editable) */}
        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            name="description"
            defaultValue="Welcome to The Corner Food Plaza! We’re excited to have you join our growing community of food entrepreneurs. Please take this opportunity to design and personalize your very own food stall, showcasing your brand, style, and culinary vision. This will help create a unique space that truly represents your business and attracts customers. (DELETE THIS AFTER READING)"
            required
            className="bg-neutral-700 border border-neutral-600 rounded-lg w-full h-32 py-3 px-6 text-gray-300"
          />
        </div>

        {/* submit */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg font-semibold shadow-md transition-all"
          >
            Save Food Stall
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddStallPage;