'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaDownload, FaFileContract, FaEye, FaCheckCircle, FaBan, FaSpinner, FaCloudUploadAlt, FaTimesCircle, FaCommentAlt, FaInfoCircle } from 'react-icons/fa';
// Ensure this path is correct for your project
import updateDocumentStatus from '@/app/actions/updateDocumentStatus'; 

// --- List of ALL REQUIRED DOCUMENTS ---
const REQUIRED_DOCUMENTS_NAMES = [
  'DTI',
  'Business Permit',
  'Safety and Sanitary Inspection (BFP)',
  'BIR',
  'Lease Agreement (Notarized)',
];

// --- Utility function (Remains the same) ---
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
  const [localDocuments, setLocalDocuments] = useState(initialDocuments);
  
  // NEW STATE: Tracks which document is being denied and the comment entered
  const [denialTarget, setDenialTarget] = useState({ fileId: null, docName: '', comment: '' });
  
  // Effect to re-sync localDocuments when the parent's 'booking' prop changes
  useEffect(() => {
    setLocalDocuments(initialDocuments);
  }, [initialDocuments]);


  if (!show || !booking) return null;
  
  // Use localDocuments to generate the map
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
      const docPdfLink = `${APPWRITE_BASE_URL}${doc.fileId}/view${APPWRITE_PROJECT_QUERY}`;
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

  // Function to initiate denial mode (show comment input)
  const initiateDenial = (fileId, docName, existingComment = '') => {
    setDenialTarget({ 
        fileId, 
        docName, 
        comment: existingComment // Pre-fill if editing an existing denial comment
    });
    // Clear any previous global status message
    setUpdateStatus(prev => ({ ...prev, message: null }));
  };

  // Function to finalize status update (used for both verify and deny)
  const handleUpdateStatus = async (fileId, newStatus, docName, comment = '') => {
    if (!booking?.['$id'] || !fileId) return;

    // 1. Confirmation check
    let confirmationMessage;
    if (newStatus === 'verified') {
        confirmationMessage = `Are you sure you want to VERIFY the status of "${docName}"?`;
    } else if (newStatus === 'denied') {
        if (comment.trim() === '') {
            return setUpdateStatus({ loadingFileId: null, message: 'Denial requires a comment.', isError: true });
        }
        confirmationMessage = `Are you sure you want to DENY "${docName}" with the comment: "${comment}"? The main booking status will be reset to 'pending'.`;
    } else {
        confirmationMessage = `Are you sure you want to change the status of "${docName}" to "${newStatus}"?`;
    }

    if (!window.confirm(confirmationMessage)) {
        return;
    }
    
    // 2. Clear denial target and set loading state
    setDenialTarget({ fileId: null, docName: '', comment: '' });
    setUpdateStatus({ loadingFileId: fileId, message: null, isError: false });

    // 3. Call the server action with the comment
    const result = await updateDocumentStatus(booking['$id'], fileId, newStatus, comment);
    
    if (result.error) {
        setUpdateStatus({ 
            loadingFileId: null, 
            message: result.error, 
            isError: true 
        });
    } else {
        // SUCCESS:
        
        // 1. Locally update the document status and comment
        setLocalDocuments(prevDocs => 
            prevDocs.map(doc => {
                if (doc.fileId === fileId) {
                    const updatedDoc = { ...doc, status: newStatus };
                    if (newStatus === 'denied') {
                        updatedDoc.comment = comment.trim();
                    } else {
                        delete updatedDoc.comment;
                    }
                    // IMPORTANT: The server action preserves tenantComment, so it remains here too.
                    return updatedDoc;
                }
                return doc;
            })
        );

        // 2. Clear loading, show success message
        setUpdateStatus({ 
            loadingFileId: null, 
            message: result.message, 
            isError: false 
        });
        
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
              const currentStatus = doc?.status || 'submitted'; 
              const adminComment = doc?.comment || ''; 
              const tenantComment = doc?.tenantComment || ''; 
              const isLoading = updateStatus.loadingFileId === doc?.fileId;
              const isDenialMode = denialTarget.fileId === doc?.fileId;
              
              // NEW: Determine if the document is verified
              const isVerified = currentStatus === 'verified'; 
              // NEW: Determine if we should show the tenant's comment
              const showTenantComment = tenantComment && !isVerified; 

              return (
                <div key={index} className={`flex flex-col p-4 border rounded-lg transition-colors 
                    ${!item.isUploaded ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                  
                  {/* Document Name and Status Row */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
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

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                      {item.isUploaded ? (
                          <>
                              {/* VIEW Button */}
                              <button
                                  onClick={() => handleView(doc)}
                                  className={`flex-shrink-0 flex items-center gap-1 font-semibold px-3 py-1 rounded-full transition-colors ${ACCENT_BG_CLASS}`}
                                  disabled={isLoading || isDenialMode}
                              >
                                  <FaEye className="text-sm" />
                                  View
                              </button>

                              {/* VERIFY Button */}
                              {!isVerified && (
                                  <button
                                      onClick={() => handleUpdateStatus(doc.fileId, 'verified', doc.name)}
                                      className={`flex-shrink-0 flex items-center gap-1 font-semibold px-3 py-1 rounded-full transition-colors ${VERIFY_BG_CLASS}`}
                                      disabled={isLoading || isDenialMode}
                                  >
                                      {isLoading ? (
                                          <FaSpinner className="animate-spin text-sm" />
                                      ) : (
                                          <FaCheckCircle className="text-sm" />
                                      )}
                                      Verify
                                  </button>
                              )}
                              
                              {/* DENY Button (Toggles Denial Mode) */}
                              {currentStatus !== 'denied' && (
                                  <button
                                      onClick={() => initiateDenial(doc.fileId, doc.name, adminComment)} 
                                      className={`flex-shrink-0 flex items-center gap-1 font-semibold px-3 py-1 rounded-full transition-colors ${DENY_BG_CLASS}`}
                                      disabled={isLoading || isDenialMode}
                                  >
                                      <FaBan className="text-sm" />
                                      Deny
                                  </button>
                              )}

                              {/* CANCEL/EDIT Denial Button */}
                              {isDenialMode && (
                                  <button
                                      onClick={() => setDenialTarget({ fileId: null, docName: '', comment: '' })}
                                      className={`flex-shrink-0 flex items-center gap-1 font-semibold px-3 py-1 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors`}
                                      disabled={isLoading}
                                  >
                                      <FaTimes className="text-sm" />
                                      Cancel
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
                  
                  {/* --- Tenant Comment Section (Visible only if NOT Verified) --- */}
                  {showTenantComment && (
                       <div className="mt-3 p-2 text-sm bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded">
                          <FaInfoCircle className="inline mr-2 text-blue-500" />
                          <span className="font-semibold">Lessee's Note: </span>
                          {tenantComment}
                       </div>
                  )}
                  {/* ------------------------------------------------------------- */}
                  
                  {/* Admin Denial Comment Section (Always visible if denied, or if in denial mode) */}
                  {(currentStatus === 'denied' && !isDenialMode) && (
                      <div className="mt-3 p-2 text-sm bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                          <FaCommentAlt className="inline mr-2 text-red-500" />
                          <span className="font-semibold">Reason for Denial: </span>
                          {adminComment || 'No reason provided.'}
                          <button
                            onClick={() => initiateDenial(doc.fileId, doc.name, adminComment)}
                            className="ml-3 text-red-500 hover:text-red-700 font-medium underline"
                          >
                            (Edit)
                          </button>
                      </div>
                  )}

                  {/* Denial Input Field (Visible when in denial mode) */}
                  {isDenialMode && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                          <label htmlFor={`comment-${doc.fileId}`} className="block text-sm font-medium text-red-600 mb-2">
                              Reason for Denial:
                          </label>
                          <textarea
                              id={`comment-${doc.fileId}`}
                              value={denialTarget.comment}
                              onChange={(e) => setDenialTarget(prev => ({ ...prev, comment: e.target.value }))}
                              placeholder="Please provide a clear reason why this document is denied (e.g., 'Notarization missing', 'Expired date')."
                              rows="3"
                              className="w-full p-2 border border-red-300 rounded-lg bg-red-50 text-gray-900 focus:ring-red-500 focus:border-red-500"
                              required
                          />
                          <button
                              onClick={() => handleUpdateStatus(denialTarget.fileId, 'denied', denialTarget.docName, denialTarget.comment)}
                              className={`mt-2 w-full flex items-center justify-center gap-2 font-bold px-4 py-2 rounded-lg transition-colors ${DENY_BG_CLASS}`}
                              disabled={denialTarget.comment.trim() === '' || isLoading}
                          >
                              <FaBan className="text-sm" />
                              Confirm Denial
                          </button>
                      </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* PDF Viewer Modal (Secondary Modal) - Remains the same */}
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

          <div className="flex justify-center p-4">
            <a
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