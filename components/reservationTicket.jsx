import React from 'react';
import { useAuth } from '@/context/authContext';

const ReservationTicket = ({ booking, showActions = true }) => {
  const { currentUser } = useAuth(); 

  // Safely retrieve room details or provide defaults
  const room = booking?.room_id || { name: 'Unknown Room', $id: '' };
  const userName = booking?.user_name || currentUser?.name || 'Unknown User';
  const userEmail = currentUser?.email || 'Unknown Email';

  // Format date function
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

  // Determine booking status
  const getStatus = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'bg-yellow-500 text-white' };
      case 'approved':
        return { text: 'Approved', color: 'bg-green-500 text-white' };
      case 'declined':
        return { text: 'Declined', color: 'bg-red-500 text-white' };
      default:
        return { text: 'Unknown', color: 'bg-gray-500 text-white' };
    }
  };

  const status = booking?.status || 'unknown';
  const { text: statusText, color: statusColor } = getStatus(status);

  // Validate booking data
  if (!room || !room.name || !booking.check_in || !booking.check_out) {
    return <div className="text-red-500">Error: Booking or Room data is incomplete!</div>;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-4 border-gray-300 max-w-lg mx-auto">
      <div className="w-full text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Reservation Ticket</h3>
        <p className="text-lg text-gray-600">{room.name}</p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Booked by:</strong> {userName}
        </p>

        {/* Agenda Field */}
        <p className="text-sm text-gray-600 mt-2">
          <strong>Agenda:</strong> {booking?.agenda || 'No agenda provided'}
        </p>

        <div className="mt-2">
          <p className="text-sm text-gray-600">
            <strong>Booking ID:</strong> {booking?.$id || 'Unknown Booking ID'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {userEmail}
          </p>
        </div>

        <div className="mt-4 mb-2">
          <p className="text-sm text-gray-600">
            <strong>Check In:</strong> {formatDate(booking.check_in)}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Check Out:</strong> {formatDate(booking.check_out)}
          </p>
        </div>

        <span
          className={`text-xs font-bold px-2 py-1 rounded ${statusColor}`}
          title="Booking Status"
        >
          {statusText}
        </span>
      </div>

      {showActions && (
        <div className="flex flex-col sm:flex-row w-full sm:w-auto sm:space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => console.log('Cancel Booking')}
            className="bg-red-500 text-white px-4 py-2 rounded mb-2 sm:mb-0 w-full sm:w-auto text-center hover:bg-red-700"
          >
            Cancel Booking
          </button>
          <button
            onClick={() => console.log('View Room')}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-2 sm:mb-0 w-full sm:w-auto text-center hover:bg-blue-700"
          >
            View Room
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationTicket;
