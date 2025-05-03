'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/authContext';
import CancelBookingButton from './CancelBookingButton';
import deleteBooking from '@/app/actions/deleteBooking';
import { FaTrashAlt } from 'react-icons/fa';

const BookedRoomCard = ({ booking, showActions = true, onDeleteSuccess }) => {
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

  if (!room || !room.name || !booking.check_in || !booking.check_out) {
    return <div className="text-red-500">Error: Lease or stall data is incomplete.</div>;
  }

  return (
    <div className="bg-white shadow-md border border-gray-300 rounded-md p-8 max-w-3xl mx-auto font-serif text-gray-800 leading-relaxed">
      <h2 className="text-2xl font-bold text-center mb-6 underline">Food Stall Lease Agreement</h2>

      <p className="mb-4">
  This document confirms that <strong>{userName}</strong> (<em>{userEmail}</em>), as the <strong>THE CORNER FOOD PLAZA</strong> owner, has officially confirmed the lease of Food Stall <strong>{room.name}</strong> here at <strong>The Corner Food Plaza</strong> under the following terms:
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
  As the management of <strong>The Corner Food Plaza</strong>, we require all stall lessees to strictly adhere to our terms, conditions, and operational guidelines. These include, but are not limited to, maintaining cleanliness and sanitation, controlling noise levels, disposing of waste properly, respecting assigned stall boundaries, and conducting themselves professionally toward customers and fellow vendors. We reserve the right to revoke or terminate any lease agreement at our discretion in cases of violations, non-compliance, or any circumstances that may compromise the safety, order, or integrity of the premises.
</p>

      </div>

      {showActions && (
        <div className="flex justify-end space-x-4 mt-10">
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
          <Link
            href={`/rooms/${room.$id}`}
            className={`border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-all ${
              isDeclined ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            View Stall
          </Link>
        </div>
      )}
    </div>
  );
};

export default BookedRoomCard;
