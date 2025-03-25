'use client';

import Link from 'next/link';
import { FaTrashAlt } from 'react-icons/fa'; 
import CancelBookingButton from './CancelBookingButton';
import deleteBooking from '@/app/actions/deleteBooking';

const BookedRoomCard = ({ booking, onDeleteSuccess }) => {
  const room = booking?.room_id || { name: 'Unknown Room', $id: '' };

  // Format date function with fallback
  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    const options = { month: 'short' };
    const month = date.toLocaleString('en-US', options, { timeZone: 'UTC' });
    const day = date.getUTCDate();
    const timeOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    };
    const time = date.toLocaleString('en-US', timeOptions);
    return `${month} ${day} at ${time}`;
  };

  // Determine status text and style
  const getStatus = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'bg-yellow-500 text-white' };
      case 'approved':
        return { text: 'Approved', color: 'bg-green-500 text-white' };
      case 'declined':
        return { text: 'Declined', color: 'line-through text-gray-500' }; // Crossed out for declined
      default:
        return { text: 'Unknown', color: 'bg-gray-500 text-white' };
    }
  };

  const status = booking?.status || 'unknown';
  const { text: statusText, color: statusColor } = getStatus(status);

  const isDeclined = status === 'declined';
  const cardOpacity = isDeclined ? 'opacity-50' : 'opacity-100';
  const cardClasses = `${cardOpacity} bg-white shadow-md rounded-lg p-4 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center transition duration-300 ease-in-out ${
    isDeclined ? 'hover:opacity-60' : 'hover:shadow-lg'
  }`;

  if (!room || !room.name || !booking.check_in || !booking.check_out) {
    return <div className="text-red-500">Error: Booking or Room data is incomplete!</div>;
  }

  // Handle delete action
  const handleDelete = async () => {
    try {
      await deleteBooking(booking.$id); // Delete booking from Appwrite
      if (onDeleteSuccess) onDeleteSuccess(booking.$id); // Notify parent component if needed
      alert('Booking deleted successfully');
    } catch (error) {
      alert('Failed to delete booking');
    }
  };

  return (
    <div className={cardClasses}>
      <div>
        <h4 className={`text-lg font-semibold ${isDeclined ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {room.name}
        </h4>
        <p className={`text-sm ${isDeclined ? 'text-gray-400' : 'text-gray-600'}`}>
          <strong>Check In:</strong> {formatDate(booking.check_in)}
        </p>
        <p className={`text-sm ${isDeclined ? 'text-gray-400' : 'text-gray-600'}`}>
          <strong>Check Out:</strong> {formatDate(booking.check_out)}
        </p>
        <span
          className={`text-xs font-bold px-2 py-1 rounded inline-block mt-2 ${statusColor}`}
          title="Booking Status"
        >
          {statusText}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row w-full sm:w-auto sm:space-x-2 mt-2 sm:mt-0">
        <Link
          href={`/rooms/${room.$id}`}
          className={`${
            isDeclined ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-blue-900 hover:to-slate-500'
          } px-6 py-3 rounded-lg mb-2 sm:mb-0 w-full sm:w-auto text-center shadow-md transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600`}
          aria-disabled={isDeclined}
        >
          {isDeclined ? 'Unavailable' : 'View Space'}
        </Link>
        {!isDeclined && <CancelBookingButton bookingId={booking.$id} />}
        {isDeclined && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 ml-2 mt-2 sm:mt-0 flex items-center space-x-1"
            aria-label="Delete booking"
          >
            <FaTrashAlt className="text-xl" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BookedRoomCard;
