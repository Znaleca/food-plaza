// BookedRoomCard.jsx
'use client';

import React, { useState } from 'react';
// 1. IMPORT useRouter from next/navigation
import { useRouter } from 'next/navigation'; 
import CancelBookingButton from './CancelBookingButton';
import deleteBooking from '@/app/actions/deleteBooking';
import { FaTrashAlt, FaRedoAlt, FaFileContract, FaTimes, FaDownload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import LeaseEditForm from './LeaseEditForm';
import ContractPreview from './ContractPreview';
import UploadedDocuments from './UploadedDocuments'; 
import approveBooking from '@/app/actions/approveBooking'; 
import declineBooking from '@/app/actions/declineBooking';

// --- List of ALL REQUIRED DOCUMENTS (Duplicated here for verification logic) ---
const REQUIRED_DOCUMENTS_NAMES = [
  'DTI',
  'Business Permit',
  'Safety and Sanitary Inspection (BFP)',
  'BIR',
  'Lease Agreement',
];

// Utility to parse documents (shared with UploadedDocuments)
const getUploadedDocuments = (booking) => {
    if (!booking?.documents || booking.documents.length === 0) return [];
    try {
        return booking.documents.map(docString => {
            if (typeof docString === 'string') {
                return JSON.parse(docString);
            }
            return docString;
        });
    } catch (e) {
        return [];
    }
};

// --- NEW VERIFICATION CHECK FUNCTION ---
const areAllDocsVerified = (booking) => {
    const uploadedDocs = getUploadedDocuments(booking);
    
    // Create a map of uploaded documents where the key is the name
    const uploadedDocMap = uploadedDocs.reduce((map, doc) => {
        map[doc.name] = doc;
        return map;
    }, {});
    
    // Check if every required document exists AND has a status of 'verified'
    const allVerified = REQUIRED_DOCUMENTS_NAMES.every(requiredName => {
        const doc = uploadedDocMap[requiredName];
        return doc && doc.status === 'verified';
    });
    
    return allVerified;
};


const BookedRoomCard = ({ booking, showActions = true, onDeleteSuccess }) => {
  // 2. Initialize router
  const router = useRouter(); 
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  // State to manage loading during status change
  const [isProcessing, setIsProcessing] = useState(false);
  // State to manage the visibility of the document list modal
  const [showDocumentList, setShowDocumentList] = useState(false); 

  const room = booking?.room || { name: 'Unknown Stall', stallNumber: 'N/A' };
  const stallName = room?.name || 'Unnamed Stall';
  const lesseeName = booking?.fname || 'Unnamed Lessee';

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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

  // MODIFIED: This variable is now only used to get the document count, not to hide the button.
  const uploadedDocumentCount = booking?.documents?.length || 0;
  
  const status = booking?.status || 'unknown';
  const { text: statusText, color: statusColor } = getStatus(status, booking?.check_out);
  const isDeclined = status === 'declined';
  const isPending = status === 'pending';
  // NEW: Check for approved status
  const isActive = status === 'approved'; 

  const durationText = calculateDurationText(booking.check_in, booking.check_out);
  
  // --- NEW: Check if all documents are verified ---
  const documentsVerified = areAllDocsVerified(booking);

  // 3. UPDATED handleDelete function
  const handleDelete = async () => {
    try {
      await deleteBooking(booking.$id);
      
      // Call router.refresh() to re-run the server component and update the list
      router.refresh(); 

      if (onDeleteSuccess) onDeleteSuccess(booking.$id);
      alert('The lease was successfully deleted.');
    } catch (error) {
      alert('Unable to delete lease. Please try again.');
    }
  };

  // --- Updated Handlers for Approve/Decline ---
  const handleStatusChange = async (action) => {
    setIsProcessing(true);
    try {
      let result;
      if (action === 'approve') {
        result = await approveBooking(booking.$id);
      } else if (action === 'decline') {
        result = await declineBooking(booking.$id);
      }

      if (result.success) {
        // 4. IMPORTANT: Call router.refresh() to trigger a client-side re-fetch
        router.refresh();
        
        // onDeleteSuccess is now optional for status changes, but we'll keep it to trigger a doc refresh 
        // if the component consuming UploadedDocuments needs it.
        if (onDeleteSuccess) {
            onDeleteSuccess(booking.$id); 
        }
        
        alert(`Lease successfully ${action === 'approve' ? 'approved' : 'declined'}. List will now refresh.`);
      } else if (result.error) {
        alert(`Operation failed: ${result.error}`);
      }

    } catch (error) {
      console.error('Error changing status:', error);
      alert('An unexpected error occurred while processing the request.');
    } finally {
      setIsProcessing(false);
    }
  };
  // ---------------------------------------

  if (!room || !booking.check_in || !booking.check_out) {
    return <div className="text-red-500">Error: Lease or stall data is incomplete.</div>;
  }

  // The original pdfLink is for the single, main signed contract (if you still use that field)
  const pdfLink = booking.pdf_attachment
    ? `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS}/files/${booking.pdf_attachment}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`
    : null;

  // Define a professional accent color (Deep Blue)
  const ACCENT_COLOR_CLASS = 'border-blue-700 text-blue-700';
  const ACCENT_BG_CLASS = 'bg-blue-700 hover:bg-blue-800 text-white';
  const SUCCESS_BG_CLASS = 'bg-green-600 hover:bg-green-700 text-white';
  const DANGER_BG_CLASS = 'bg-red-600 hover:bg-red-700 text-white';
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

      {/* View Signed PDF Contract Button (Uses old 'pdf_attachment' field) */}
      {pdfLink && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => setShowPdfViewer(true)}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded text-sm font-semibold transition-all ${ACCENT_BG_CLASS}`}
          >
            <FaFileContract />
            <span>View Main Signed Contract</span>
          </button>
        </div>
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

          {/* --- Approve and Decline Buttons for Pending Leases (CONDITIONAL) --- */}
          {isPending && documentsVerified && (
            <>
              <button
                onClick={() => handleStatusChange('approve')}
                disabled={isProcessing}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded text-xs sm:text-sm font-semibold transition-all ${SUCCESS_BG_CLASS} disabled:opacity-50`}
              >
                <FaCheckCircle />
                <span>{isProcessing ? 'Approving...' : 'Approve Lease'}</span>
              </button>

              <button
                onClick={() => handleStatusChange('decline')}
                disabled={isProcessing}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded text-xs sm:text-sm font-semibold transition-all ${DANGER_BG_CLASS} disabled:opacity-50`}
              >
                <FaTimesCircle />
                <span>{isProcessing ? 'Declining...' : 'Decline Lease'}</span>
              </button>
            </>
          )}

          {/* --- Notice if Pending but Docs NOT Verified --- */}
          {isPending && !documentsVerified && (
            <div className="p-2 border border-yellow-400 bg-yellow-100 text-yellow-800 text-xs rounded-lg font-semibold flex items-center justify-center space-x-1">
                <FaTimesCircle />
                <span>Documents must be verified before approval.</span>
            </div>
          )}

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
          
          {/* View Uploaded Documents Button - ALWAYS SHOWN and CLICKABLE */}
          <button
            onClick={() => setShowDocumentList(true)}
            className={`flex items-center justify-center space-x-2 border px-4 py-2 rounded text-xs sm:text-sm font-semibold transition-all ${ACCENT_COLOR_CLASS} hover:bg-blue-50`}
          >
            <FaFileContract />
            {/* Display the count of documents from the array length */}
            <span>View Docs ({uploadedDocumentCount})</span> 
          </button>

          {/* View Contract Button (Secondary/Fallback Action) */}
          {/* MODIFIED: Hide "View Contract Draft" when approved */}
          {!pdfLink && !isActive && (
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

      {/* Contract Preview Modal (Draft) */}
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
      
      {/* UploadedDocuments component (Always rendered, controlled by showDocumentList) */}
      {/* We pass router.refresh as a callback to ensure document updates also refresh the list */}
      <UploadedDocuments 
        booking={booking} 
        show={showDocumentList} 
        onClose={() => setShowDocumentList(false)} 
        onUpdateSuccess={() => router.refresh()} 
      />

      {/* Signed PDF Viewer Modal (Uses old 'pdf_attachment' field) */}
      {showPdfViewer && pdfLink && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-[60] flex flex-col p-2 sm:p-4">
          <div className="flex justify-end p-2">
            <button
              onClick={() => setShowPdfViewer(false)}
              className="text-white text-3xl hover:text-red-500 transition-colors"
              aria-label="Close PDF Viewer"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="flex-grow bg-white rounded-lg shadow-xl overflow-hidden">
            <iframe
              src={pdfLink}
              title="Signed Lease Contract"
              className="w-full h-full border-0"
              frameBorder="0"
            >
              <p className="p-4 text-center">Your browser does not support iframes. You can <a href={pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">download the PDF here</a>.</p>
            </iframe>
          </div>

          <div className="flex justify-center p-4">
            <a
                href={pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-2 bg-blue-700 text-white px-5 sm:px-6 py-2 rounded-full text-sm hover:bg-blue-800 transition-colors shadow-lg"
            >
                <FaDownload className="text-lg" />
                <span>Download PDF</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookedRoomCard;