'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import leaseStall from '@/app/actions/leaseStall';
import { useEffect, useState } from 'react';

const LeaseForm = ({ room }) => {
  const router = useRouter();
  const [minStartDate, setMinStartDate] = useState('');
  const [minEndDate, setMinEndDate] = useState('');

  useEffect(() => {
    // Get Philippine local date (YYYY-MM-DD)
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const phDate = new Date(now);

    const year = phDate.getFullYear();
    const month = String(phDate.getMonth() + 1).padStart(2, '0');
    const day = String(phDate.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    setMinStartDate(today);

    // End date must be at least tomorrow
    const tomorrow = new Date(phDate);
    tomorrow.setDate(phDate.getDate() + 1);
    const tYear = tomorrow.getFullYear();
    const tMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tDay = String(tomorrow.getDate()).padStart(2, '0');
    setMinEndDate(`${tYear}-${tMonth}-${tDay}`);
  }, []);

  const handleStartDateChange = (e) => {
    const start = new Date(e.target.value);
    if (isNaN(start)) return;

    // End date = start + 1 day
    const nextDay = new Date(start);
    nextDay.setDate(start.getDate() + 1);
    const year = nextDay.getFullYear();
    const month = String(nextDay.getMonth() + 1).padStart(2, '0');
    const day = String(nextDay.getDate()).padStart(2, '0');
    setMinEndDate(`${year}-${month}-${day}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Philippine local time (HH:mm format only)
    const now = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    // Always checkout at end of the day → "23:59"
    const checkoutTime = '23:59';

    // Append correct time values (HH:mm)
    formData.append('check_in_time', now);
    formData.append('check_out_time', checkoutTime);

    const res = await leaseStall(null, formData);
    if (res.error) toast.error(res.error);
    if (res.success) {
      toast.success('Stall has been leased! Awaiting approval.');
      router.push('/bookings');
    }
  };

  return (
    <div className="mt-2 bg-neutral-900 text-white p-8 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="room_id" value={room.$id} />
        <input type="hidden" name="status" value="pending" />

        {/* Full Name */}
        <div>
          <label htmlFor="fname" className="block text-sm font-medium text-white">
            Full Name of Tenant
          </label>
          <input
            type="text"
            id="fname"
            name="fname"
            maxLength={100}
            required
            placeholder="Enter full name"
            className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="check_in_date" className="block text-sm font-medium text-white">
              Start Date
            </label>
            <input
              type="date"
              id="check_in_date"
              name="check_in_date"
              min={minStartDate}
              onChange={handleStartDateChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="check_out_date" className="block text-sm font-medium text-white">
              End Date
            </label>
            <input
              type="date"
              id="check_out_date"
              name="check_out_date"
              min={minEndDate}
              required
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-semibold text-sm rounded-md shadow-md hover:from-yellow-300 hover:to-pink-400 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
          >
            Send Approval
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaseForm;
