'use client';

import { toast } from 'react-toastify';
import leaseStall from '@/app/actions/leaseStall';

const LeaseEditForm = ({ booking, onClose }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await leaseStall(booking.$id, formData);
    if (res.error) toast.error(res.error);
    if (res.success) {
      toast.success('Lease has been renewed! Awaiting approval.');
      if (onClose) onClose(); // ✅ Close modal after success
    }
  };

  return (
    <div className="mt-4 bg-neutral-900 text-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4">
        Renew Lease for {booking.room_id?.name}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="check_in_date" className="block text-sm font-medium text-white">
              New Start Date
            </label>
            <input
              type="date"
              id="check_in_date"
              name="check_in_date"
              required
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="check_in_time" className="block text-sm font-medium text-white">
              Time In
            </label>
            <input
              type="time"
              id="check_in_time"
              name="check_in_time"
              required
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="check_out_date" className="block text-sm font-medium text-white">
              New End Date
            </label>
            <input
              type="date"
              id="check_out_date"
              name="check_out_date"
              required
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="check_out_time" className="block text-sm font-medium text-white">
              Time Out
            </label>
            <input
              type="time"
              id="check_out_time"
              name="check_out_time"
              required
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-pink-500 text-white font-semibold text-sm rounded-md shadow-md hover:from-yellow-400 hover:to-pink-400 transition duration-300"
        >
          Renew Lease
        </button>
      </form>
    </div>
  );
};

export default LeaseEditForm;
