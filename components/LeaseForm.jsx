'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import bookSpace from '@/app/actions/bookSpace';

const BookingForm = ({ room }) => {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await bookSpace(null, formData);
    if (res.error) toast.error(res.error);
    if (res.success) {
      toast.success('Space has been booked!');
      router.push('/bookings');
    }
  };

  return (
    <div className="mt-2 bg-neutral-900 text-white p-8 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="room_id" value={room.$id} />
        <input type="hidden" name="status" value="pending" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="check_in_date" className="block text-sm font-medium text-white">
              Start Date
            </label>
            <input
              type="date"
              id="check_in_date"
              name="check_in_date"
              required
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
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
              required
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
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
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="attachment" className="block text-sm font-medium text-white">
            Upload PDF (Optional)
          </label>
          <input
            type="file"
            id="attachment"
            name="attachment"
            accept="application/pdf"
            className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
          />
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

export default BookingForm;
