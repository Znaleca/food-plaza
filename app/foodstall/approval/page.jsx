'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/authContext';
import getAllReservations from '@/app/actions/getAllReservations';
import getMySpaces from '@/app/actions/getMySpaces';
import ReservationTicket from '@/components/reservationTicket';
import UploadDocuments from '@/components/UploadDocuments';
import { FaFileContract } from 'react-icons/fa'; 

// Appwrite endpoint and bucket
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;

// Required document names
const REQUIRED_DOCUMENTS = [
  'DTI',
  'Business Permit',
  'Safety and Sanitary Inspection (BFP)',
  'BIR',
  'Lease Agreement',
];

const ApprovalPage = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [myRoomIds, setMyRoomIds] = useState([]);
  const [openPreview, setOpenPreview] = useState(null);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  
  // NEW STATE: For the main contract PDF viewer
  const [showMainPdfViewer, setShowMainPdfViewer] = useState(false); 
  const ACCENT_BG_CLASS = 'bg-yellow-500 text-neutral-900 hover:bg-yellow-400';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myRooms = await getMySpaces();
        const roomIds = myRooms.map((room) => room.$id);
        setMyRoomIds(roomIds);

        const allBookings = await getAllReservations();
        const myBookings = allBookings.filter((booking) =>
          roomIds.includes(booking.room_id?.$id || booking.room_id)
        );

        setBookings(myBookings);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, []);

  // --- MODIFIED: Accepts the new document list to update state ---
  const handleDocumentsUploaded = (bookingId, newDocuments) => {
    // Only update if the server action returned the new list
    if (newDocuments) {
      setBookings((prev) =>
        prev.map((b) =>
          b.$id === bookingId ? { ...b, documents: newDocuments } : b
        )
      );
      // Reset preview after a successful upload to ensure the new file is loaded on view
      setOpenPreview(null);
      setActivePreviewDoc(null);
    }
  };
  // -------------------------------------------------------------

  const isExpired = (checkOut) => {
    if (!checkOut) return false;
    return new Date() > new Date(checkOut);
  };

  // Parse JSON strings from booking.documents
  const parseDocuments = (documents) => {
    if (!documents || documents.length === 0) return [];
    try {
      if (typeof documents[0] === 'string') {
        return documents.map((docString) => JSON.parse(docString));
      }
      return documents;
    } catch (error) {
      console.error('Error parsing booking documents:', error);
      return [];
    }
  };

  const allDocumentsAreReady = (booking) => {
    const uploadedNames = new Set(
      parseDocuments(booking.documents).map((doc) => doc.name)
    );
    return REQUIRED_DOCUMENTS.every((docName) => uploadedNames.has(docName));
  };

  // HANDLER FOR PREVIEW TOGGLE - MUST BE PASSED TO CHILD
  const handlePreviewToggle = (bookingId, docName) => {
    const isCurrentlyOpen =
      openPreview === bookingId && activePreviewDoc === docName;
    if (isCurrentlyOpen) {
      setOpenPreview(null);
      setActivePreviewDoc(null);
    } else {
      setOpenPreview(bookingId);
      setActivePreviewDoc(docName);
    }
  };

  // Helper icons - NOW PASSED TO CHILD
  const CheckMark = ({ className }) => (
    <span className={`font-bold ${className}`}>✓</span>
  );
  const Dot = ({ className }) => (
    <span className={`text-[10px] ${className}`}>•</span>
  );
  const Warning = ({ className }) => (
    <span className={`font-bold ${className}`}>!</span>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <h2 className="text-base sm:text-lg text-pink-600 font-light tracking-widest">
          MY STALL
        </h2>
        <p className="text-2xl sm:text-4xl md:text-5xl font-extrabold">
          Lease Management
        </p>
      </div>

      {/* Booking List */}
      <div className="space-y-10 mt-10 sm:mt-12">
        {bookings.length === 0 ? (
          <p className="text-gray-400 text-center text-sm sm:text-base">
            No lease found for your food stall
          </p>
        ) : (
          bookings.map((booking) => {
            const expired = isExpired(booking.check_out);
            const uploadedDocuments = parseDocuments(booking.documents);
            const documentsReady = allDocumentsAreReady(booking);
            
            // Check if the current booking's documents are being previewed
            const isPreviewOpen = openPreview === booking.$id;

            // Get fileId for the active preview document
            const previewFileId = uploadedDocuments.find(
                (d) => d.name === activePreviewDoc
            )?.fileId;

            // NEW: Check for the old 'pdf_attachment' field
            const pdfLink = booking.pdf_attachment;


            return (
              <div
                key={booking.$id}
                className="space-y-5 border-b border-neutral-800 pb-10"
              >
                {/* Reservation Ticket */}
                <ReservationTicket booking={booking} showActions={false} />

                {/* View Signed PDF Contract Button (Uses old 'pdf_attachment' field) */}
                {pdfLink && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={() => setShowMainPdfViewer(true)} // Toggle state
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded text-sm font-semibold transition-all ${ACCENT_BG_CLASS}`}
                    >
                      <FaFileContract />
                      <span>View Main Signed Contract</span>
                    </button>
                  </div>
                )}

                {/* Main Signed Contract PDF Viewer */}
                {showMainPdfViewer && pdfLink && (
                    <div className="rounded-lg p-3 bg-neutral-900 shadow-inner mt-4">
                        <h4 className="text-sm font-bold mb-2 text-gray-300 flex justify-between items-center">
                            <span>Main Signed Contract</span>
                            <button
                                onClick={() => setShowMainPdfViewer(false)}
                                className="text-red-500 hover:text-red-400 text-xs font-semibold"
                            >
                                Close Viewer
                            </button>
                        </h4>
                        <iframe
                            src={pdfLink} 
                            className="w-full h-[600px] rounded-md border border-neutral-700"
                            title="Main Signed Contract"
                        />
                    </div>
                )}
                

                {/* Documents Section - Now handled by UploadDocuments */}
                <div className="space-y-4">
                  
                  {/* The combined Document List / Upload Form */}
                  <UploadDocuments
                    bookingId={booking.$id}
                    // --- UPDATED PROP CALL ---
                    onUploaded={handleDocumentsUploaded} // Use the modified handler
                    // -------------------------
                    uploadedDocuments={uploadedDocuments}
                    requiredDocuments={REQUIRED_DOCUMENTS} // Pass required docs list
                    // Pass the necessary state and handlers for preview
                    openPreview={openPreview} 
                    activePreviewDoc={activePreviewDoc}
                    handlePreviewToggle={handlePreviewToggle}
                    // Pass helper icons for consistency
                    CheckMark={CheckMark}
                    Dot={Dot}
                    Warning={Warning}
                    File={() => <span>[PDF]</span>} 
                    Hide={() => <span>[HIDE]</span>}
                  />

                  {/* Status Message (Kept in parent for consistency) */}
                  {documentsReady ? (
                    <p className="flex items-center gap-2 text-green-400 text-sm bg-green-900/30 border border-green-700 px-3 py-2 rounded-md">
                      <CheckMark className='text-xl' /> All required documents have been uploaded.
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-900/30 border border-yellow-700 px-3 py-2 rounded-md">
                      <Warning className='text-xl' /> Please upload all required documents.
                    </p>
                  )}

                  {/* PDF Preview (Kept in parent as it manages the iframe) */}
                  {isPreviewOpen && activePreviewDoc && previewFileId && (
                    <div className="rounded-lg p-3 bg-neutral-900 shadow-inner">
                      <h4 className="text-sm font-bold mb-2 text-gray-300">
                        Previewing: {activePreviewDoc}
                      </h4>
                      {(() => {
                        const previewUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${previewFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;

                        return (
                          <iframe
                            src={previewUrl}
                            className="w-full h-[600px] rounded-md border border-neutral-700"
                            title={activePreviewDoc}
                          />
                        );
                      })()}
                    </div>
                  )}
                  {/* Handle missing file case in preview */}
                  {isPreviewOpen && activePreviewDoc && !previewFileId && (
                    <div className="rounded-lg p-3 bg-neutral-900 shadow-inner">
                        <p className="text-gray-400">
                            File not found for this document.
                        </p>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApprovalPage;