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
  const lesseeName = booking?.fname || 'Unnamed Lessee';

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // TIME OPTIONS REMOVED
    return date.toLocaleDateString(undefined, options);
  };

  const calculateDurationText = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 'N/A';

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let months = (checkOut.getFullYear() - checkIn.getFullYear()) * 12;
    months -= checkIn.getMonth();
    months += checkOut.getMonth();

    if (months > 0 && diffDays > 0) {
      if (months === 6) return '6 Months';
      if (months === 12) return '1 Year';
      if (months === 18) return '1 Year, 6 Months';
      if (months === 24) return '2 Years';
      if (months === 36) return '3 Years';
      
      if (months >= 1) return `${months} Months`;
    }

    if (diffDays <= 31) {
      return `${diffDays} Days`;
    }

    return `${months} Months (approx.)`;
  };

  const getStatus = (status, checkOutDate) => {
    const now = new Date();
    const checkOut = new Date(checkOutDate);

    if (checkOutDate && checkOut < now) {
      return { text: 'Expired', color: 'text-gray-500 bg-gray-100 rounded-sm px-1' };
    }

    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'text-yellow-700 bg-yellow-100 rounded-sm px-1' };
      case 'approved':
        return { text: 'Active', color: 'text-green-700 bg-green-100 rounded-sm px-1' };
      case 'declined':
        return { text: 'Declined', color: 'text-red-700 bg-red-100 rounded-sm px-1' };
      default:
        return { text: 'Unknown', color: 'text-gray-500 bg-gray-100 rounded-sm px-1' };
    }
  };

  const status = booking?.status || 'unknown';
  const { text: statusText, color: statusColor } = getStatus(status, booking?.check_out);
  const isDeclined = status === 'declined';
  const durationText = calculateDurationText(booking.check_in, booking.check_out);

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

  // Define a professional accent color (Deep Blue)
  const ACCENT_COLOR_CLASS = 'border-blue-700 text-blue-700';
  const ACCENT_BG_CLASS = 'bg-blue-700 hover:bg-blue-800 text-white';
  const WARNING_COLOR_CLASS = 'border-red-700 text-red-700 hover:bg-red-700 hover:text-white';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 text-center text-gray-800 shadow-md transition-shadow duration-300 hover:shadow-lg">
      
      {/* Contract Header */}
      <div className="border-b-2 border-blue-700 pb-3 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-gray-900">
          Lease Agreement: {stallName}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Stall #{room.stallNumber || 'N/A'}
        </p>
      </div>

      {/* Lessee & ID Block */}
      <div className="mb-6 space-y-1">
        <p className="text-base sm:text-lg font-semibold text-gray-900">
          Lessee: <span className="font-extrabold">{lesseeName}</span>
        </p>
        <p className="text-xs text-gray-500">
          Lease ID: {booking?.$id || 'N/A'}
        </p>
      </div>

      {/* Details Table */}
      <div className="text-sm border border-gray-200 rounded-lg p-4 sm:p-5 bg-gray-50 text-left">
        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <p className="font-medium text-gray-600">Lease Duration:</p>
            <p className="font-extrabold text-gray-900 text-right">{durationText}</p>
            
            <p className="font-medium text-gray-600">Start Date:</p>
            <p className="text-gray-800 text-right">{formatDate(booking.check_in)}</p>

            <p className="font-medium text-gray-600">End Date:</p>
            <p className="text-gray-800 text-right">{formatDate(booking.check_out)}</p>

            <p className="font-medium text-gray-600">Status:</p>
            <p className="text-right">
                <span className={`text-xs font-semibold uppercase ${statusColor}`}>{statusText}</span>
            </p>
        </div>
      </div>

      {/* View PDF / Contract Button */}
      {pdfLink && (
        <a
          href={pdfLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-6 w-full flex items-center justify-center space-x-2 px-4 py-2 rounded text-sm font-semibold transition-all ${ACCENT_BG_CLASS}`}
        >
          <FaFileContract />
          <span>Download Signed PDF Contract</span>
        </a>
      )}

      {/* Agreement Notice */}
      <div className="mt-6 text-[11px] sm:text-xs text-gray-600 border-t pt-4 text-left">
        <p>
          <strong className="text-gray-900">Notice:</strong> The lease for{' '}
          <strong className="text-gray-900">{stallName}</strong> requires compliance with all{' '}
          <strong className="text-gray-900">The Corner Food Plaza</strong> policies. Non-compliance
          may result in termination.
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-col sm:flex-row flex-wrap justify-center mt-6 gap-3 sm:gap-4 border-t pt-4">

          {/* Renew Lease Button (Primary Action) */}
          {statusText === 'Expired' && (
            <button
              onClick={() => setShowRenewForm(true)}
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded text-xs sm:text-sm font-semibold transition-all ${ACCENT_BG_CLASS}`}
            >
              <FaRedoAlt />
              <span>Renew Lease</span>
            </button>
          )}

          {/* View Contract Button (Secondary/Fallback Action) */}
          {!pdfLink && (
            <button
              onClick={() => setShowContract(true)}
              className={`flex items-center justify-center space-x-2 border px-4 py-2 rounded text-xs sm:text-sm font-semibold transition-all ${ACCENT_COLOR_CLASS} hover:bg-blue-50`}
            >
              <FaFileContract />
              <span>View Contract Draft</span>
            </button>
          )}

          {/* Cancel Booking Button (Tertiary/Warning Action) */}
          <CancelBookingButton bookingId={booking.$id} isLightBackground={true} />

          {/* Delete Lease Button (Dangerous/Declined Action) */}
          {isDeclined && (
            <button
              onClick={handleDelete}
              className={`flex items-center justify-center space-x-2 border px-4 py-2 rounded text-xs sm:text-sm font-semibold transition-all ${WARNING_COLOR_CLASS}`}
            >
              <FaTrashAlt />
              <span>Delete Lease</span>
            </button>
          )}
        </div>
      )}

      {/* Renew Lease Modal */}
      {showRenewForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50 p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            <button
              onClick={() => setShowRenewForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 transition-colors text-2xl z-10"
              aria-label="Close renewal form"
            >
              <FaTimes />
            </button>
            <LeaseEditForm booking={booking} onClose={() => setShowRenewForm(false)} />
          </div>
        </div>
      )}

      {/* Contract Preview Modal */}
      {showContract && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 p-4 overflow-y-auto">
          <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
            {/* Contract Content */}
            <ContractPreview booking={booking} isLightBackground={true} />

            {/* Close Button */}
            <button
              onClick={() => setShowContract(false)}
              className="mt-6 flex items-center gap-2 bg-gray-300 text-gray-800 px-5 sm:px-6 py-2 rounded-full text-sm hover:bg-red-600 hover:text-white transition-colors shadow-lg"
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