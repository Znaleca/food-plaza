// UploadedDocuments.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaDownload, FaFileContract, FaEye, FaCheckCircle, FaBan, FaSpinner, FaCloudUploadAlt, FaTimesCircle } from 'react-icons/fa';
// Ensure this path is correct for your project
import updateDocumentStatus from '@/app/actions/updateDocumentStatus'; 

// --- List of ALL REQUIRED DOCUMENTS ---
const REQUIRED_DOCUMENTS_NAMES = [
  'DTI',
  'Business Permit',
  'Safety and Sanitary Inspection (BFP)',
  'BIR',
  'Lease Agreement',
];

// --- Utility function (Remains the same) ---
const getUploadedDocuments = (booking) => {
  if (!booking?.documents || booking.documents.length === 0) return [];
  try {
    // booking.documents is an array of JSON strings
    return booking.documents.map(docString => {
      // Safely parse each JSON string
      if (typeof docString === 'string') {
        return JSON.parse(docString);
      }
      // If it's already an object (e.g., in a testing environment)
      return docString;
    });
  } catch (e) {
    console.error("Failed to parse booking documents:", e);
    return [];
  }
};

/**
 * A modal component to display a list of uploaded documents for a lease, 
 * with an integrated PDF viewer for each document.
 */
const UploadedDocuments = ({ booking, show, onClose, onUpdateSuccess }) => {
  const initialDocuments = useMemo(() => getUploadedDocuments(booking), [booking]);
  const [viewingDocument, setViewingDocument] = useState(null); 
  const [updateStatus, setUpdateStatus] = useState({ loadingFileId: null, message: null, isError: false });
  // NEW STATE: Documents that can be updated locally
  const [localDocuments, setLocalDocuments] = useState(initialDocuments);
  
  // Effect to re-sync localDocuments when the parent's 'booking' prop changes
  useEffect(() => {
    setLocalDocuments(initialDocuments);
  }, [initialDocuments]);


  if (!show || !booking) return null;
  
  // Use localDocuments instead of calling getUploadedDocuments(booking) directly
  const uploadedDocMap = localDocuments.reduce((map, doc) => {
    map[doc.name] = doc;
    return map;
  }, {});
  
  // Generate the full checklist
  const documentChecklist = REQUIRED_DOCUMENTS_NAMES.map(name => {
      const uploadedDoc = uploadedDocMap[name];
      return {
          name,
          isUploaded: !!uploadedDoc,
          uploadedDoc: uploadedDoc,
      };
  });


  // Base URL for the Appwrite file view endpoint
  const APPWRITE_BASE_URL = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS}/files/`;
  const APPWRITE_PROJECT_QUERY = `?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;

  const handleView = (doc) => {
      if (!doc?.fileId) return;
      // Create the direct view link
      const docPdfLink = `${APPWRITE_BASE_URL}${doc.fileId}/view${APPWRITE_PROJECT_QUERY}`;
      // Set the document and its PDF link for the viewer modal
      setViewingDocument({ ...doc, pdfLink: docPdfLink });
  };

  const handleCloseViewer = () => {
    setViewingDocument(null);
  };
  
  const ACCENT_BG_CLASS = 'bg-blue-700 hover:bg-blue-800 text-white';
  const VERIFY_BG_CLASS = 'bg-green-600 hover:bg-green-700 text-white';
  const DENY_BG_CLASS = 'bg-red-600 hover:bg-red-700 text-white';
  const STATUS_COLOR_CLASSES = {
      verified: 'text-green-600 font-bold',
      denied: 'text-red-600 font-bold',
      submitted: 'text-gray-500 italic',
  };

  // --- Handler for Status Update ---
  const handleUpdateStatus = async (fileId, newStatus, docName) => {
    if (!booking?.['$id'] || !fileId) return;

    // Confirm action with the user
    const actionText = newStatus === 'verified' ? 'VERIFY' : 'DENY';
    let confirmationMessage;

    if (newStatus === 'verified') {
        confirmationMessage = `Are you sure you want to VERIFY the status of "${docName}"?`;
    } else if (newStatus === 'denied') {
        // IMPROVED MESSAGE: Warn that denying a document may require the user to re-upload.
        confirmationMessage = `Are you sure you want to DENY the status of "${docName}"? The user will typically need to re-upload this document.`;
    } else {
        confirmationMessage = `Are you sure you want to change the status of "${docName}" to "${newStatus}"?`;
    }

    if (!window.confirm(confirmationMessage)) {
        return;
    }

    // Set loading state for the specific file
    setUpdateStatus({ loadingFileId: fileId, message: null, isError: false });

    // Call the server action
    const result = await updateDocumentStatus(booking['$id'], fileId, newStatus);
    
    if (result.error) {
        setUpdateStatus({ 
            loadingFileId: null, 
            message: result.error, 
            isError: true 
        });
    } else {
        // SUCCESS:
        
        // 1. Locally update the document status to reflect the change immediately
        setLocalDocuments(prevDocs => 
            prevDocs.map(doc => 
                doc.fileId === fileId ? { ...doc, status: newStatus } : doc
            )
        );

        // 2. Clear loading, show success message
        setUpdateStatus({ 
            loadingFileId: null, 
            message: result.message, 
            isError: false 
        });
        
        // OPTIONAL: Keep this to notify the parent a change occurred,
        // but now it doesn't need to re-fetch to update the modal content.
        if (onUpdateSuccess) {
            setTimeout(() => onUpdateSuccess(), 500); 
        }
    }
  };


  return (
    <>
      {/* Document List Modal (Primary Modal) */}
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50 p-4">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-6">
          <h4 className="text-xl font-bold mb-4 border-b pb-2 text-gray-900">
              <FaFileContract className="inline mr-2 text-blue-700" />
              Required Lease Documents Checklist
          </h4>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 transition-colors text-2xl z-10"
            aria-label="Close document list"
          >
            <FaTimes />
          </button>

            {/* Global Status Message for Updates */}
            {updateStatus.message && (
                <div className={`p-3 rounded-lg text-sm mb-4 ${updateStatus.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {updateStatus.message}
                </div>
            )}

          <div className="space-y-3">
            {documentChecklist.map((item, index) => {
              const doc = item.uploadedDoc;
              // currentStatus is now driven by the local state via documentChecklist
              const currentStatus = doc?.status || 'submitted'; 
              const isLoading = updateStatus.loadingFileId === doc?.fileId;

              return (
                <div key={index} className={`flex flex-col md:flex-row justify-between items-start md:items-center p-3 border rounded-lg transition-colors 
                    ${!item.isUploaded ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  
                  <div className="flex flex-col mb-2 md:mb-0 md:mr-4 flex-grow">
                      <span className="font-medium text-gray-700 break-words pr-2">{item.name}</span>
                      <div className="flex items-center mt-1">
                          {item.isUploaded ? (
                              <>
                                <FaCheckCircle className="text-sm text-green-600 mr-2" />
                                <span className={`text-xs uppercase ${STATUS_COLOR_CLASSES[currentStatus] || 'text-gray-500'}`}>
                                  Uploaded - Status: {currentStatus}
                                </span>
                              </>
                          ) : (
                              <>
                                <FaTimesCircle className="text-sm text-red-600 mr-2" />
                                <span className="text-xs uppercase text-red-600 font-semibold">
                                  Missing
                                </span>
                              </>
                          )}
                      </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                    {/* Actions are ONLY available if the document is uploaded */}
                    {item.isUploaded ? (
                        <>
                            {/* VIEW Button */}
                            <button
                                onClick={() => handleView(doc)}
                                className={`flex-shrink-0 flex items-center gap-1 font-semibold px-3 py-1 rounded-full transition-colors ${ACCENT_BG_CLASS}`}
                                disabled={isLoading}
                            >
                                <FaEye className="text-sm" />
                                View
                            </button>

                            {/* VERIFY Button */}
                            {currentStatus !== 'verified' && (
                                <button
                                    onClick={() => handleUpdateStatus(doc.fileId, 'verified', doc.name)}
                                    className={`flex-shrink-0 flex items-center gap-1 font-semibold px-3 py-1 rounded-full transition-colors ${VERIFY_BG_CLASS}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <FaSpinner className="animate-spin text-sm" />
                                    ) : (
                                        <FaCheckCircle className="text-sm" />
                                    )}
                                    Verify
                                </button>
                            )}
                            
                            {/* DENY Button */}
                            {currentStatus !== 'denied' && (
                                <button
                                    // newStatus is 'denied', which is supported by the server action
                                    onClick={() => handleUpdateStatus(doc.fileId, 'denied', doc.name)} 
                                    className={`flex-shrink-0 flex items-center gap-1 font-semibold px-3 py-1 rounded-full transition-colors ${DENY_BG_CLASS}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <FaSpinner className="animate-spin text-sm" />
                                    ) : (
                                        <FaBan className="text-sm" />
                                    )}
                                    Deny
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-500 italic">
                             <FaCloudUploadAlt /> Awaiting Upload
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* PDF Viewer Modal (Secondary Modal) */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-[60] flex flex-col p-2 sm:p-4">
          <div className="flex justify-between items-center p-2">
            <h5 className="text-white text-sm sm:text-lg font-semibold truncate max-w-[80%]">
                Viewing: {viewingDocument.name}
            </h5>
            <button
              onClick={handleCloseViewer}
              className="text-white text-3xl hover:text-red-500 transition-colors"
              aria-label={`Close viewer for ${viewingDocument.name}`}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="flex-grow bg-white rounded-lg shadow-xl overflow-hidden">
            <iframe
              // Use the link generated in handleView
              src={viewingDocument.pdfLink} 
              title={`Document: ${viewingDocument.name}`}
              className="w-full h-full border-0"
              frameBorder="0"
            >
              <p className="p-4 text-center">
                  Your browser does not support iframes. 
                  <a href={viewingDocument.pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View or download the PDF here
                  </a>.
              </p>
            </iframe>
          </div>

          {/* Download button below the viewer (Kept for convenience) */}
          <div className="flex justify-center p-4">
            <a
                // Use the link for download
                href={`${APPWRITE_BASE_URL}${viewingDocument.fileId}/download${APPWRITE_PROJECT_QUERY}`}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center gap-2 bg-blue-700 text-white px-5 sm:px-6 py-2 rounded-full text-sm hover:bg-blue-800 transition-colors shadow-lg"
            >
                <FaDownload className="text-lg" />
                <span>Download Document</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadedDocuments;