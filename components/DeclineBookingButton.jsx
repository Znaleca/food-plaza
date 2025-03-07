'use client';
import { toast } from 'react-toastify';
import declineBooking from '@/app/actions/declineBooking';

const DeclineBookingButton = ({ bookingId }) => {
  const handleDeclineClick = async () => {
    if (!confirm('Are you sure you want to decline this booking?')) {
      return;
    }

    try {
      const result = await declineBooking(bookingId);

      if (result.success) {
        toast.success('Booking declined successfully!');
      } else {
        toast.error(result.error || 'Failed to decline booking');
      }
    } catch (error) {
      console.log('Failed to decline booking', error);
      toast.error('Failed to decline booking');
    }
  };

  return (
    <button
      onClick={handleDeclineClick}
      className='bg-yellow-500 text-white px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-yellow-700'
    >
      Decline Booking
    </button>
  );
};

export default DeclineBookingButton;
