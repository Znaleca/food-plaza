import React from 'react';
import { useAuth } from '@/context/authContext';

const ReservationTicket = ({ booking, showActions = true }) => {
  const { currentUser } = useAuth(); 

  const room = booking?.room_id || { name: 'Unknown Room', $id: '' };
  const userName = booking?.user_name || currentUser?.name || 'Unknown User';
  const userEmail = currentUser?.email || 'Unknown Email';

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return `${date.toLocaleDateString(undefined, options)} at ${date.toLocaleTimeString(undefined, timeOptions)}`;
  };

  const getStatus = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'text-yellow-600' };
      case 'approved':
        return { text: 'Approved', color: 'text-green-700' };
      case 'declined':
        return { text: 'Declined', color: 'text-red-600' };
      default:
        return { text: 'Unknown', color: 'text-gray-500' };
    }
  };

  const status = booking?.status || 'unknown';
  const { text: statusText, color: statusColor } = getStatus(status);

  if (!room || !room.name || !booking.check_in || !booking.check_out) {
    return <div className="text-red-500">Error: Lease or Food Stall data is incomplete!</div>;
  }

  return (
    <div className="bg-white shadow-md border border-gray-300 rounded-md p-8 max-w-3xl mx-auto font-serif text-gray-800 leading-relaxed">
      <h2 className="text-2xl font-bold text-center mb-6 underline">Food Stall Lease Agreement</h2>

      <p className="mb-4">
        This document confirms that <strong>{userName}</strong> (<em>{userEmail}</em>) has requested to lease the Food Stall <strong>{room.name}</strong> under the following terms:
      </p>

      <div className="mb-6">
        <p><strong>Lease ID:</strong> {booking?.$id || 'N/A'}</p>
        <p><strong>Agenda:</strong> {booking?.agenda || 'N/A'}</p>
        <p><strong>Lease Start:</strong> {formatDate(booking.check_in)}</p>
        <p><strong>Lease End:</strong> {formatDate(booking.check_out)}</p>
        <p><strong>Status:</strong> <span className={`${statusColor}`}>{statusText}</span></p>
      </div>

      <hr className="my-6 border-gray-400" />

      <div className="text-sm mb-6">
  <p>
    By proceeding with this lease, the lessee agrees to comply with all terms, conditions, and operational guidelines
    set forth by <strong>The Corner Food Plaza</strong>. These include but are not limited to cleanliness and sanitation
    standards, noise control, proper waste disposal, adherence to assigned stall boundaries, and respectful conduct
    toward customers and fellow vendors. The management of The Corner Food Plaza reserves the right to revoke or
    terminate the lease agreement at any time in the event of violations, non-compliance, or for any reason deemed
    necessary to maintain the safety and order of the premises.
  </p>
</div>


      {showActions && (
        <div className="flex justify-end space-x-4 mt-10">
          <button
            onClick={() => console.log('Cancel Booking')}
            className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition-all"
          >
            Cancel Booking
          </button>
          <button
            onClick={() => console.log('View Room')}
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-all"
          >
            View Room
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationTicket;
