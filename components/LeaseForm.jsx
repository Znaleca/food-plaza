'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import leaseStall from '@/app/actions/leaseStall';
import { useEffect, useState } from 'react';

const LeaseForm = ({ room }) => {
  const router = useRouter();
  const [minStartDate, setMinStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('6months');

  useEffect(() => {
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const phDate = new Date(now);
    const year = phDate.getFullYear();
    const month = String(phDate.getMonth() + 1).padStart(2, '0');
    const day = String(phDate.getDate()).padStart(2, '0');
    setMinStartDate(`${year}-${month}-${day}`);
  }, []);

  const handleStartDateChange = (e) => {
    const startDate = new Date(e.target.value);
    if (!isNaN(startDate)) calculateEndDate(startDate, duration);
  };

  const handleDurationChange = (e) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    const startInput = document.getElementById('check_in_date');
    if (startInput?.value) calculateEndDate(new Date(startInput.value), newDuration);
  };

  const calculateEndDate = (startDate, type) => {
    const newEnd = new Date(startDate);
    if (type === '6months') newEnd.setMonth(newEnd.getMonth() + 6);
    if (type === '1year') newEnd.setFullYear(newEnd.getFullYear() + 1);
    if (type === '2years') newEnd.setFullYear(newEnd.getFullYear() + 2);
    const year = newEnd.getFullYear();
    const month = String(newEnd.getMonth() + 1).padStart(2, '0');
    const day = String(newEnd.getDate()).padStart(2, '0');
    setEndDate(`${year}-${month}-${day}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Combine names
    const first = formData.get('firstName') || '';
    const middle = formData.get('middleName') || '';
    const last = formData.get('lastName') || '';
    const suffix = formData.get('suffix') || '';
    const fullName = [first, middle, last, suffix].filter(Boolean).join(' ');
    formData.append('fname', fullName);
    formData.delete('firstName');
    formData.delete('middleName');
    formData.delete('lastName');
    formData.delete('suffix');

    // Time handling
    const now = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    formData.append('check_in_time', now);
    formData.append('check_out_time', '23:59');
    formData.append('check_out_date', endDate);
    if (room?.stallNumber) formData.append('stallNumber', room.stallNumber.toString());

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
        <input type="hidden" name="stallNumber" value={room.stallNumber || ''} readOnly />
        <input type="hidden" id="check_out_date" name="check_out_date" value={endDate} readOnly />

        {/* Full Name */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">Full Name of Lessee</label>
          <div className="grid grid-cols-4 gap-3">
            <input type="text" id="firstName" name="firstName" required placeholder="First Name *" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm" />
            <input type="text" id="middleName" name="middleName" placeholder="Middle Name" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm" />
            <input type="text" id="lastName" name="lastName" required placeholder="Last Name *" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm" />
            <input type="text" id="suffix" name="suffix" placeholder="Suffix (Optional)" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm" />
          </div>
          <p className="text-xs text-gray-400">* Required field</p>
        </div>

        {/* Gender & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-white">Gender *</label>
            <select id="gender" name="gender" required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm">
              <option value="">-- Select Male or Female --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-white">Phone Number (11 digits) *</label>
            <input
              type="text"
              inputMode="numeric"
              id="phoneNumber"
              name="phoneNumber"
              maxLength={11}
              pattern="^[0-9]{11}$"
              required
              placeholder="e.g., 09123456789"
              title="Phone number must be exactly 11 digits (e.g., 09123456789)"
              onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ''))}
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>

        {/* Address & Social Media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="residentialAddress" className="block text-sm font-medium text-white">Residential Address *</label>
            <input type="text" id="residentialAddress" name="residentialAddress" required maxLength={255} placeholder="Enter full residential address" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm" />
          </div>
          <div>
            <label htmlFor="socialMediaAccount" className="block text-sm font-medium text-white">Social Media Link (Optional)</label>
            <input type="url" id="socialMediaAccount" name="socialMediaAccount" maxLength={100} placeholder="https://facebook.com/your-profile" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm" />
          </div>
        </div>

        {/* Start Date & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="check_in_date" className="block text-sm font-medium text-white">Start Date *</label>
            <input type="date" id="check_in_date" name="check_in_date" min={minStartDate} onChange={handleStartDateChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm" />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-white">Duration *</label>
            <select id="duration" name="duration" value={duration} onChange={handleDurationChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm sm:text-sm">
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
              <option value="2years">2 Years</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div>
          <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-semibold text-sm rounded-md shadow-md hover:from-yellow-300 hover:to-pink-400 transition duration-300">
            Send Approval
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaseForm;
