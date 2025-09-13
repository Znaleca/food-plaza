'use client';

import React from 'react';
import { useAuth } from '@/context/authContext';

const ReservationTicket = ({ booking, showActions = true }) => {
  const { currentUser } = useAuth();

  const room = booking?.room_id || { name: 'Unknown Stall', stallNumber: 'N/A', $id: '' };
  const userName = booking?.user_name || currentUser?.name || 'Unknown User';
  const userEmail = currentUser?.email || 'Unknown Email';

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    return `${date.toLocaleDateString(undefined, options)} at ${date.toLocaleTimeString(undefined, timeOptions)}`;
  };

  const getStatus = (status, checkOut) => {
    const now = new Date();
    const checkoutDate = checkOut ? new Date(checkOut) : null;

    if (checkoutDate && now > checkoutDate) {
      return { text: 'Expired', color: 'text-gray-400' };
    }

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
  const { text: statusText, color: statusColor } = getStatus(status, booking?.check_out);

  if (!room || !booking.check_in || !booking.check_out) {
    return <div className="text-red-500">Error: Lease or stall data is incomplete.</div>;
  }

  return (
    <div className="w-full bg-neutral-900 border border-pink-600 rounded-xl p-6 text-center text-white hover:bg-neutral-950 transition-all duration-300 font-sans leading-relaxed">
      {/* Decorative Line */}
      <div className="w-16 h-0.5 bg-pink-600 mx-auto mb-4" />

      {/* Title */}
      <h2 className="text-2xl font-bold tracking-widest uppercase mb-6">
        Food Stall Lease Agreement
      </h2>

      {/* Intro Text */}
      <p className="mb-6 text-sm font-light">
        This document confirms that <strong>{userName}</strong> (<em>{userEmail}</em>) has requested to lease the Food Stall <strong>{room.name}</strong> under the following terms:
      </p>

      {/* Details */}
      <div className="text-sm space-y-2 font-light mb-6 text-left">
        <p><span className="font-semibold">Lease ID:</span> {booking?.$id || 'N/A'}</p>
        <p><span className="font-semibold">Lease Start:</span> {formatDate(booking.check_in)}</p>
        <p><span className="font-semibold">Lease End:</span> {formatDate(booking.check_out)}</p>
        <p><span className="font-semibold">Status:</span> <span className={statusColor}>{statusText}</span></p>
      </div>

      {/* Decorative Line */}
      <div className="w-16 h-0.5 bg-gray-600 mx-auto mb-6" />

      {/* Agreement Notice */}
      <div className="text-xs text-gray-300 font-extralight text-left">
        <p>
          By proceeding with this lease, the lessee agrees to comply with all terms, conditions, and operational guidelines
          set forth by <strong>The Corner Food Plaza</strong>. These include cleanliness, noise control, waste disposal, stall boundaries, and respectful conduct. Management reserves the right to terminate the lease for violations.
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => console.log('Cancel Booking')}
            className="border border-red-600 text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition-all"
          >
            Cancel Booking
          </button>
          <button
            onClick={() => console.log('View Room')}
            className="border border-pink-600 text-pink-600 px-4 py-2 rounded hover:bg-pink-600 hover:text-white transition-all"
          >
            View Room
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationTicket;
