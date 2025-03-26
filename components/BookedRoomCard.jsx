'use client';

import Link from 'next/link';
import { FaTrashAlt } from 'react-icons/fa'; 
import CancelBookingButton from './CancelBookingButton';
import deleteBooking from '@/app/actions/deleteBooking';

const BookedRoomCard = ({ booking, onDeleteSuccess }) => {
  const room = booking?.room_id || { name: 'Unknown Room', $id: '' };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  // Determine status
  const getStatus = (status) => {
    switch (status) {
      case 'pending': return { text: 'Pending', color: 'text-yellow-600 border-yellow-500' };
      case 'approved': return { text: 'Approved', color: 'text-green-600 border-green-500' };
      case 'declined': return { text: 'Declined', color: 'text-red-600 border-red-500' };
      default: return { text: 'Unknown', color: 'text-gray-600 border-gray-500' };
    }
  };

  const status = booking?.status || 'unknown';
  const { text: statusText, color: statusColor } = getStatus(status);

  const isDeclined = status === 'declined';

  // Handle delete action
  const handleDelete = async () => {
    try {
      await deleteBooking(booking.$id);
      if (onDeleteSuccess) onDeleteSuccess(booking.$id);
      alert('Booking deleted successfully');
    } catch (error) {
      alert('Failed to delete booking');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-300 p-6 mt-4 max-w-md mx-auto relative">
      {/* Receipt Header */}
      <div className="text-center pb-4 border-b border-gray-300">
        <h4 className="text-xl font-semibold text-gray-800">{room.name}</h4>
        <p className="text-sm text-gray-600">Lease Receipt</p>
      </div>

      {/* Booking Details */}
      <div className="py-4 text-sm space-y-2">
        <p><strong className="text-gray-700">Check In:</strong> {formatDate(booking.check_in)}</p>
        <p><strong className="text-gray-700">Check Out:</strong> {formatDate(booking.check_out)}</p>
        <p className={`text-sm border rounded-md px-2 py-1 w-fit ${statusColor}`}>
          <strong>Status:</strong> {statusText}
        </p>
      </div>

      {/* Receipt Footer */}
      <div className="pt-4 border-t border-gray-300 flex justify-between items-center">
        <Link
          href={`/rooms/${room.$id}`}
          className={`px-6 py-2 rounded-lg text-white shadow-md transition-all duration-200 ease-in-out ${
            isDeclined
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-800'
          }`}
        >
          {isDeclined ? 'Unavailable' : 'View Space'}
        </Link>

        {/* Buttons for Cancel or Delete */}
        <div className="flex items-center space-x-3">
          {!isDeclined && <CancelBookingButton bookingId={booking.$id} />}
          {isDeclined && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 flex items-center space-x-1"
            >
              <FaTrashAlt className="text-xl" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookedRoomCard;
