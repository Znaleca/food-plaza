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
    <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Approve Lease</h2>
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="room_id" value={room.$id} />
        <input type="hidden" name="status" value="pending" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="check_in_date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="check_in_date"
              name="check_in_date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="check_in_time" className="block text-sm font-medium text-gray-700">
              Time In
            </label>
            <input
              type="time"
              id="check_in_time"
              name="check_in_time"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="check_out_date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="check_out_date"
              name="check_out_date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="check_out_time" className="block text-sm font-medium text-gray-700">
              Time Out
            </label>
            <input
              type="time"
              id="check_out_time"
              name="check_out_time"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Agenda Field */}
        <div>
          <label htmlFor="agenda" className="block text-sm font-medium text-gray-700">
           Other Request (Optional)
          </label>
          <textarea
            id="agenda"
            name="agenda"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Describe your request."
            
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-black text-white font-medium text-sm rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition duration-300"
          >
            Send Approval
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
