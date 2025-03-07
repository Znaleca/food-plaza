'use client';
import { toast } from 'react-toastify';
import deleteBooking from '@/app/actions/deleteBooking';

const DeleteBookingButton = ({ bookingId }) => {
  const handleDeleteClick = async () => {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const result = await deleteBooking(bookingId);

      if (result.success) {
        toast.success('Booking deleted successfully!');
      }
    } catch (error) {
      console.log('Failed to delete booking', error);
      return {
        error: 'Failed to delete booking',
      };
    }
  };

  return (
    <button
      onClick={handleDeleteClick}
      className='bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-red-700'
    >
      Delete Booking
    </button>
  );
};

export default DeleteBookingButton;
