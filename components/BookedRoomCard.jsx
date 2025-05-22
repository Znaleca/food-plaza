'use client';

import React from 'react';
import { useAuth } from '@/context/authContext';
import CancelBookingButton from './CancelBookingButton';
import deleteBooking from '@/app/actions/deleteBooking';
import { FaTrashAlt } from 'react-icons/fa';

const BookedRoomCard = ({ booking, showActions = true, onDeleteSuccess }) => {
  const { currentUser } = useAuth();

  const room = booking?.room_id || { name: 'Unknown Stall', stallNumber: 'N/A', $id: '' };
  const stallName = room?.name || 'Unnamed Stall';

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    return `${date.toLocaleDateString(undefined, options)} at ${date.toLocaleTimeString(undefined, timeOptions)}`;
  };

  const getStatus = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'text-yellow-400' };
      case 'approved':
        return { text: 'Approved', color: 'text-green-400' };
      case 'declined':
        return { text: 'Declined', color: 'text-red-500' };
      default:
        return { text: 'Unknown', color: 'text-gray-400' };
    }
  };

  const status = booking?.status || 'unknown';
  const { text: statusText, color: statusColor } = getStatus(status);
  const isDeclined = status === 'declined';

  const handleDelete = async () => {
    try {
      await deleteBooking(booking.$id);
      if (onDeleteSuccess) onDeleteSuccess(booking.$id);
      alert('Booking successfully deleted.');
    } catch (error) {
      alert('Unable to delete booking. Please try again.');
    }
  };

  if (!room || !booking.check_in || !booking.check_out) {
    return <div className="text-red-500">Error: Lease or stall data is incomplete.</div>;
  }

  return (
    <div className="bg-neutral-900 border border-pink-600 rounded-xl p-6 text-center text-white hover:bg-neutral-950 transition-all duration-300">
      {/* Decorative Line */}
      <div className="w-16 h-0.5 bg-pink-600 mx-auto mb-4" />

      {/* Title */}
      <h3 className="text-base font-bold tracking-widest uppercase mb-2">
        Food Stall Lessee: {stallName} (Stall #{room.stallNumber || 'N/A'})
      </h3>

      {/* Decorative Line */}
      <div className="w-16 h-0.5 bg-gray-600 mx-auto mb-6" />

      {/* Details */}
      <div className="text-sm space-y-2 font-light">
        <p><span className="font-semibold">Lease ID:</span> {booking?.$id || 'N/A'}</p>
        <p><span className="font-semibold">Agenda:</span> {booking?.agenda || 'N/A'}</p>
        <p><span className="font-semibold">Start:</span> {formatDate(booking.check_in)}</p>
        <p><span className="font-semibold">End:</span> {formatDate(booking.check_out)}</p>
        <p><span className="font-semibold">Status:</span> <span className={statusColor}>{statusText}</span></p>
      </div>

      {/* Agreement Notice */}
      <div className="mt-6 text-xs text-gray-300 font-extralight text-left">
        <p>
          As the management of <strong className="text-white">The Corner Food Plaza</strong>, we confirm that the food stall named <strong className="text-white">{stallName}</strong> is the official lessee of this leased space. All lessees must comply with our policies regarding cleanliness, behavior, waste disposal, and noise management. Non-compliance may result in immediate termination of the lease.
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex justify-center mt-6 space-x-4">
          {!isDeclined && (
            <CancelBookingButton bookingId={booking.$id} />
          )}
          {isDeclined && (
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition-all"
            >
              <FaTrashAlt />
              <span>Delete Booking</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookedRoomCard;
