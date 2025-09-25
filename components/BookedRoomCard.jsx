'use client';

import React, { useState } from 'react';
import CancelBookingButton from './CancelBookingButton';
import deleteBooking from '@/app/actions/deleteBooking';
import { FaTrashAlt, FaRedoAlt, FaFileContract, FaTimes } from 'react-icons/fa';
import LeaseEditForm from './LeaseEditForm';
import ContractPreview from './ContractPreview';

const BookedRoomCard = ({ booking, showActions = true, onDeleteSuccess }) => {
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [showContract, setShowContract] = useState(false);

  const room = booking?.room || { name: 'Unknown Stall', stallNumber: 'N/A' };
  const stallName = room?.name || 'Unnamed Stall';
  const tenantName = booking?.fname || 'Unnamed Tenant';

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    return `${date.toLocaleDateString(undefined, options)} at ${date.toLocaleTimeString(
      undefined,
      timeOptions
    )}`;
  };

  const getStatus = (status, checkOutDate) => {
    const now = new Date();
    const checkOut = new Date(checkOutDate);

    if (checkOutDate && checkOut < now) {
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
  const isDeclined = status === 'declined';

  const handleDelete = async () => {
    try {
      await deleteBooking(booking.$id);
      if (onDeleteSuccess) onDeleteSuccess(booking.$id);
      alert('The lease was successfully deleted.');
    } catch (error) {
      alert('Unable to delete lease. Please try again.');
    }
  };

  if (!room || !booking.check_in || !booking.check_out) {
    return <div className="text-red-500">Error: Lease or stall data is incomplete.</div>;
  }

  const pdfLink = booking.pdf_attachment
    ? `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS}/files/${booking.pdf_attachment}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`
    : null;

  return (
    <div className="bg-neutral-900 border border-pink-600 rounded-xl p-4 sm:p-6 text-center text-white hover:bg-neutral-950 transition-all duration-300">
      {/* Decorative Line */}
      <div className="w-12 sm:w-16 h-0.5 bg-pink-600 mx-auto mb-3 sm:mb-4" />

      {/* Title */}
      <h3 className="text-sm sm:text-base font-bold tracking-widest uppercase mb-2">
        Food Stall Lessee: {stallName} (Stall #{room.stallNumber || 'N/A'})
      </h3>

      {/* Tenant Full Name */}
      <p className="text-xs sm:text-sm text-gray-300 mb-4">
        <span className="font-semibold text-white">Tenant:</span> {tenantName}
      </p>

      {/* Decorative Line */}
      <div className="w-12 sm:w-16 h-0.5 bg-gray-600 mx-auto mb-4 sm:mb-6" />

      {/* Details */}
      <div className="text-xs sm:text-sm space-y-2 font-light text-left sm:text-center">
        <p>
          <span className="font-semibold">Lease ID:</span> {booking?.$id || 'N/A'}
        </p>
        <p>
          <span className="font-semibold">Start:</span> {formatDate(booking.check_in)}
        </p>
        <p>
          <span className="font-semibold">End:</span> {formatDate(booking.check_out)}
        </p>
        <p>
          <span className="font-semibold">Status:</span>{' '}
          <span className={statusColor}>{statusText}</span>
        </p>

        {/* 📄 View Lease Document (PDF) Button-style Link */}
        {pdfLink && (
          <a
            href={pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center space-x-2 border border-yellow-400 text-yellow-400 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-yellow-600 hover:text-white transition-all"
          >
            <FaFileContract />
            <span>View Lease Document (PDF)</span>
          </a>
        )}
      </div>

      {/* Agreement Notice */}
      <div className="mt-4 sm:mt-6 text-[11px] sm:text-xs text-gray-300 font-extralight text-left">
        <p>
          As the management of <strong className="text-white">The Corner Food Plaza</strong>, we
          confirm that the food stall named <strong className="text-white">{stallName}</strong> is
          leased by tenant <strong className="text-white">{tenantName}</strong>. All lessees must
          comply with our policies regarding cleanliness, behavior, waste disposal, and noise
          management. Non-compliance may result in immediate termination of the lease.
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-col sm:flex-row flex-wrap justify-center mt-6 gap-3 sm:gap-4">
          {/* Always show Cancel Button */}
          <CancelBookingButton bookingId={booking.$id} />

          {isDeclined && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center space-x-2 border border-red-600 text-red-600 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-red-600 hover:text-white transition-all"
            >
              <FaTrashAlt />
              <span>Delete Lease</span>
            </button>
          )}

          {statusText === 'Expired' && (
            <button
              onClick={() => setShowRenewForm(true)}
              className="flex items-center justify-center space-x-2 border border-yellow-400 text-yellow-400 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-yellow-600 hover:text-white transition-all"
            >
              <FaRedoAlt />
              <span>Renew Lease</span>
            </button>
          )}

          {/* Conditional "View Contract" Button - Only show if no PDF link exists */}
          {!pdfLink && (
            <button
              onClick={() => setShowContract(true)}
              className="flex items-center justify-center space-x-2 border border-pink-500 text-pink-500 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm hover:bg-pink-600 hover:text-white transition-all"
            >
              <FaFileContract />
              <span>View Contract</span>
            </button>
          )}
        </div>
      )}

      {/* Renew Lease Modal */}
      {showRenewForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-xl">
            <button
              onClick={() => setShowRenewForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors text-2xl z-10"
              aria-label="Close renewal form"
            >
              &times;
            </button>
            <LeaseEditForm booking={booking} onClose={() => setShowRenewForm(false)} />
          </div>
        </div>
      )}

      {/* Contract Preview Modal */}
      {showContract && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 p-4 overflow-y-auto">
          <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
            {/* Contract Content */}
            <ContractPreview booking={booking} />

            {/* Close Button */}
            <button
              onClick={() => setShowContract(false)}
              className="mt-6 flex items-center gap-2 bg-gray-700 text-white px-5 sm:px-6 py-2 rounded-full text-sm hover:bg-red-600 transition-colors shadow-lg"
              aria-label="Close contract preview"
            >
              <FaTimes className="text-lg" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookedRoomCard;