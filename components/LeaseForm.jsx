'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'react-toastify';
import bookSpace from '@/app/actions/bookSpace';

const BookingForm = ({ room }) => {
  const [state, formAction] = useFormState(bookSpace, {});
  const router = useRouter();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success('Space has been booked!');
      router.push('/bookings');
    }
  }, [state]);

  return (
    <div className="mt-10 bg-neutral-900 text-white p-8 rounded-xl shadow-lg ">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">Approve Lease</h2>

      <form action={formAction} className="space-y-6">
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
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
              required
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
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
              required
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
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
              required
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
              className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Agenda Field */}
        <div>
          <label htmlFor="agenda" className="block text-sm font-medium text-white">
            Other Request (Optional)
          </label>
          <textarea
            id="agenda"
            name="agenda"
            rows={3}
            className="mt-1 block w-full px-3 py-2 bg-neutral-900 text-white border border-gray-600 rounded-md shadow-sm focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
            placeholder="Describe your request."
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-yellow-500 text-white font-semibold text-sm rounded-md shadow-md hover:bg-yellow-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
          >
            Send Approval
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
