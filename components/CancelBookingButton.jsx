'use client';
import { toast } from 'react-toastify';
import cancelBooking from '@/app/actions/cancelBooking';

const CancelBookingButton = ({ bookingId }) => {
  const handleCancelClick = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        toast.success('Booking cancelled successfully!');
      }
    } catch (error) {
      console.log('Failed to cancel booking', error);
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <button
      onClick={handleCancelClick}
      className="bg-neutral-800 text-white px-6 py-3 rounded-lg w-full sm:w-auto text-center shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-gradient-to-r hover:from-yellow-500 hover:to-pink-500 hover:text-white"
    >
      Cancel Lease
    </button>
  );
};

export default CancelBookingButton;
