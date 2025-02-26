'use client';
import { toast } from 'react-toastify';
import approveBooking from '@/app/actions/approveBooking';

const ApproveBookingButton = ({ bookingId }) => {
  const handleApproveClick = async () => {
    if (!confirm('Are you sure you want to approve this booking?')) {
      return;
    }

    try {
      const result = await approveBooking(bookingId);

      if (result.success) {
        toast.success('Booking approved successfully!');
      } else {
        toast.error(result.error || 'Failed to approve booking');
      }
    } catch (error) {
      console.log('Failed to approve booking', error);
      toast.error('Failed to approve booking');
    }
  };

  return (
    <button
      onClick={handleApproveClick}
      className='bg-green-500 text-white px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-green-700'
    >
      Approve Booking
    </button>
  );
};

export default ApproveBookingButton;
