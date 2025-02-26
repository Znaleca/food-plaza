'use client';
import { toast } from 'react-toastify';
import cancelBooking from '@/app/actions/cancelBooking';

const CancelBookingButton = ({ bookingId }) => {
  const handleCancelClick = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const result = await cancelBooking(bookingId);

      if (result.success) {
        toast.success('Booking cancelled successfully!');
      }
    } catch (error) {
      console.log('Failed to cancel booking', error);
      return {
        error: 'Failed to cancel booking',
      };
    }
  };

  return (
    <button
      onClick={handleCancelClick}
      className='bg-gradient-to-r from-slate-800 to-black text-white px-6 py-3 rounded-lg w-full sm:w-auto text-center shadow-md hover:scale-105 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600'
    >
      Cancel Reservation
    </button>
  );
};

export default CancelBookingButton;
