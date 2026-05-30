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
  'Lease Agreement (Notarized)',
];

const ApprovalPage = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [myRoomIds, setMyRoomIds] = useState([]);
  const [openPreview, setOpenPreview] = useState(null);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  
  // NEW STATE: For the main contract PDF viewer
  const [showMainPdfViewer, setShowMainPdfViewer] = useState(false); 
  const ACCENT_BG_CLASS = 'border-2 border-black bg-red-600 text-white hover:bg-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-y-[2px]';

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
    <div className="min-h-screen bg-white px-2 py-5 text-neutral-950 selection:bg-red-600 selection:text-white md:px-4 md:py-8">
      <section className="border-4 border-black bg-white px-5 py-8 shadow-[10px_10px_0px_#000] md:px-8 md:py-10">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-red-600">Food Stall Panel</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">Lease Approval</h1>
            <p className="mt-3 text-sm font-medium text-neutral-700 md:text-base">Review lessee submissions, upload required documents, and verify readiness in one workspace.</p>
          </div>
          <div className="inline-flex items-center border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
            {bookings.length} Leases
          </div>
        </div>
      </section>

      <div className="mt-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-700">
          Signed in as <span className="text-red-600">{currentUser?.name || 'Stall User'}</span>
        </p>
      </div>

      {/* Booking List */}
      <div className="mt-6 space-y-8">
        {bookings.length === 0 ? (
          <div className="border-4 border-black bg-white p-10 text-center shadow-[8px_8px_0px_#000]">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">No Lease Found</p>
            <p className="mt-3 text-sm font-medium text-neutral-700">No lease found for your food stall.</p>
          </div>
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
                className="space-y-5 border-4 border-black bg-white p-4 shadow-[8px_8px_0px_#000] md:p-6"
              >
                {/* Reservation Ticket */}
                <ReservationTicket booking={booking} showActions={false} />

                {/* View Signed PDF Contract Button (Uses old 'pdf_attachment' field) */}
                {pdfLink && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={() => setShowMainPdfViewer(true)} // Toggle state
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold transition-all ${ACCENT_BG_CLASS}`}
                    >
                      <FaFileContract />
                      <span>View Main Signed Contract</span>
                    </button>
                  </div>
                )}

                {/* Main Signed Contract PDF Viewer */}
                {showMainPdfViewer && pdfLink && (
                  <div className="mt-4 border-2 border-black bg-neutral-100 p-3 shadow-[4px_4px_0px_#000]">
                    <h4 className="mb-2 flex items-center justify-between text-sm font-black uppercase tracking-wider text-neutral-800">
                            <span>Main Signed Contract</span>
                            <button
                                onClick={() => setShowMainPdfViewer(false)}
                        className="border border-black bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-600 hover:bg-black hover:text-white"
                            >
                                Close Viewer
                            </button>
                        </h4>
                        <iframe
                            src={pdfLink} 
                      className="h-[600px] w-full border-2 border-black bg-white"
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
                    <p className="flex items-center gap-2 border-2 border-black bg-green-200 px-3 py-2 text-sm font-semibold text-green-900">
                      <CheckMark className='text-xl' /> All required documents have been uploaded.
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 border-2 border-black bg-yellow-100 px-3 py-2 text-sm font-semibold text-yellow-900">
                      <Warning className='text-xl' /> Please upload all required documents.
                    </p>
                  )}

                  {/* PDF Preview (Kept in parent as it manages the iframe) */}
                  {isPreviewOpen && activePreviewDoc && previewFileId && (
                    <div className="border-2 border-black bg-neutral-100 p-3 shadow-[4px_4px_0px_#000]">
                      <h4 className="mb-2 text-sm font-black uppercase tracking-wider text-neutral-800">
                        Previewing: {activePreviewDoc}
                      </h4>
                      {(() => {
                        const previewUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${previewFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;

                        return (
                          <iframe
                            src={previewUrl}
                            className="h-[600px] w-full border-2 border-black bg-white"
                            title={activePreviewDoc}
                          />
                        );
                      })()}
                    </div>
                  )}
                  {/* Handle missing file case in preview */}
                  {isPreviewOpen && activePreviewDoc && !previewFileId && (
                    <div className="border-2 border-black bg-neutral-100 p-3 shadow-[4px_4px_0px_#000]">
                        <p className="text-sm font-medium text-neutral-700">
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