'use client';

import { toast } from 'react-toastify';
import updateDocuments from '@/app/actions/updateDocuments'; 
import { useState } from 'react';
import { 
    FaCheckCircle, 
    FaTimesCircle, 
    FaFileAlt, 
    FaEye, 
    FaEyeSlash, 
    FaEdit, 
    FaBan, 
    FaSpinner,
    FaArrowUp,
    FaHourglassHalf,
    FaCloudUploadAlt,
    FaCommentAlt,
    FaInfoCircle // New icon for tenant comment prompt
} from 'react-icons/fa';

// Helper function to render status badge with icons (No change)
const StatusBadge = ({ status }) => {
    let Icon = FaHourglassHalf; 
  let color = 'text-amber-800';
  let bgColor = 'bg-amber-200';
    let label = 'Submitted';
    
    const normalizedStatus = status ? status.toLowerCase() : 'submitted'; 

    switch (normalizedStatus) {
      case 'verified':
      case 'approved':
        Icon = FaCheckCircle;
        color = 'text-emerald-800';
        bgColor = 'bg-emerald-200';
        label = 'Verified';
        break;
      case 'denied':
      case 'rejected':
        Icon = FaTimesCircle;
        color = 'text-red-700';
        bgColor = 'bg-red-200';
        label = 'Denied';
        break;
      case 'submitted':
      case 'pending':
      default:
        Icon = FaHourglassHalf; 
        color = 'text-amber-800';
        bgColor = 'bg-amber-200';
        label = 'Submitted';
        break;
    }

    return (
      <span className={`inline-flex items-center border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${bgColor}`}>
        <Icon className={`mr-2 ${color}`} />
        <span className={color}>{label}</span>
      </span>
    );
}

// Simple component to display the file name and a link to view the temporary PDF (No change)
const FilePreview = ({ fileItem }) => {
  if (!fileItem) return null;

  return (
    <div className="mt-3 flex items-center justify-between border-2 border-black bg-neutral-100 p-3 text-sm">
      <div className="flex items-center truncate">
        <FaFileAlt className="mr-2 flex-shrink-0 text-base text-red-600" />
        <span className="truncate text-xs font-black uppercase tracking-[0.12em] text-neutral-700">
          Ready: <strong className="text-neutral-950">{fileItem.name}</strong>
        </span>
      </div>
      <a 
        href={fileItem.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="ml-4 flex-shrink-0 border-b-2 border-black text-xs font-black uppercase tracking-[0.12em] text-red-600 hover:text-black"
      >
        View Preview
      </a>
    </div>
  );
};

const UploadDocuments = ({ 
    bookingId, 
    onUploaded, 
    uploadedDocuments = [],
    requiredDocuments, 
    openPreview,       
    activePreviewDoc,  
    handlePreviewToggle, 
}) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isEditing, setIsEditing] = useState({}); 
  const [isLoading, setIsLoading] = useState(false);
  // NEW STATE: To store the tenant's comment for each document being uploaded
  const [uploadComment, setUploadComment] = useState({}); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedFiles).length === 0) return; 
    
    setIsLoading(true);
    const formData = new FormData(e.target);
    
    // Manually append the comments to the FormData
    Object.entries(uploadComment).forEach(([inputName, comment]) => {
        // Only append if a file for this inputName is selected
        if(selectedFiles[inputName]) {
            formData.append(`comment_${inputName}`, comment);
        }
    });

    const res = await updateDocuments(bookingId, formData, requiredDocuments); 

    Object.values(selectedFiles).forEach(item => {
        if (item.url) {
            URL.revokeObjectURL(item.url);
        }
    });
    setSelectedFiles({}); 
    setIsEditing({}); 
    setUploadComment({}); // Clear comments after submission
    setIsLoading(false);

    if (res.error) {
      toast.error(res.error);
    }
    if (res.success) {
      toast.success('Documents uploaded successfully!');
      if (onUploaded) onUploaded(bookingId, res.newDocuments); 
    }
  };

  const handleFileChange = (e, docName) => {
    const file = e.target.files[0];
    const inputName = docName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    if (selectedFiles[inputName]?.url) {
      URL.revokeObjectURL(selectedFiles[inputName].url);
    }

    if (file) {
      const fileUrl = URL.createObjectURL(file);
      
      setSelectedFiles(prev => ({
        ...prev,
        [inputName]: { file: file, url: fileUrl, name: file.name }
      }));
      // Keep existing comment or start new one when file is selected
    } else {
      setSelectedFiles(prev => {
        const newState = { ...prev };
        delete newState[inputName];
        return newState;
      });
      // Clear comment if file is deselected
      setUploadComment(prev => {
          const newState = { ...prev };
          delete newState[inputName];
          return newState;
      });
    }
  };

  const handleEditToggle = (inputName, docName) => {
    const shouldEdit = !isEditing[inputName];

    if (shouldEdit) {
        setSelectedFiles(prev => {
            const newState = { ...prev };
            if (newState[inputName]?.url) {
                URL.revokeObjectURL(newState[inputName].url);
            }
            delete newState[inputName];
            return newState;
        });
        setUploadComment(prev => {
            const newState = { ...prev };
            delete newState[inputName];
            return newState;
        });
        if (openPreview === bookingId && activePreviewDoc === docName) {
             handlePreviewToggle(bookingId, docName);
        }
    }
    
    setIsEditing(prev => ({
        ...prev,
        [inputName]: shouldEdit
    }));
  };

  const isBookingPreviewOpen = openPreview === bookingId;
  const isSubmitEnabled = Object.keys(selectedFiles).length > 0 && !isLoading;


  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full space-y-6 border-4 border-black bg-white p-4 shadow-[8px_8px_0px_#000] md:p-6"
    >
      <h3 className="mb-2 border-b-2 border-black pb-3 text-2xl font-black uppercase tracking-[0.16em] text-neutral-950">
        Lessee Documentation
      </h3>
      
      <div className="space-y-5">
        {requiredDocuments.map((docName, index) => {
            const inputName = docName.toLowerCase().replace(/[^a-z0-9]/g, '_'); 
            const fileItem = selectedFiles[inputName];
            
            const existingDoc = uploadedDocuments.find(doc => doc.name === docName);
            
            const alreadyUploaded = !!existingDoc;
            const currentStatus = existingDoc?.status || 'submitted'; 
            const denialComment = existingDoc?.comment || ''; 
            
            const normalizedStatus = currentStatus.toLowerCase();
            const isVerified = normalizedStatus === 'verified' || normalizedStatus === 'approved';
            const isDenied = normalizedStatus === 'denied' || normalizedStatus === 'rejected';
            
            // Show file input if no file is uploaded OR if we're in editing mode
            const showFileInput = !alreadyUploaded || isEditing[inputName];
            
            const isSelectedForPreview = isBookingPreviewOpen && activePreviewDoc === docName;

            let DocIcon = FaFileAlt;
            let iconColor = 'text-neutral-600';

            if (alreadyUploaded) {
                if (isVerified) {
                    DocIcon = FaFileAlt;
                  iconColor = 'text-emerald-700';
                } else if (isDenied) {
                    DocIcon = FaTimesCircle;
                  iconColor = 'text-red-700';
                } else {
                    DocIcon = FaHourglassHalf;
                  iconColor = 'text-amber-700';
                }
            }

            const statusMessage = isVerified 
                ? "Your document is **Verified**. Replacement is not permitted."
                : isDenied 
                ? "Review failed. Please review the requirement and click 'Replace' to upload a new file."
                : alreadyUploaded 
                ? "Document submitted successfully. Waiting for administrator review."
                : "Required: Please upload the document to proceed with the lease request.";

            const messageColor = isVerified ? 'text-emerald-900' : isDenied ? 'text-red-900' : alreadyUploaded ? 'text-amber-900' : 'text-neutral-700';
            const messageBgColor = isVerified ? 'bg-emerald-100' : isDenied ? 'bg-red-100' : alreadyUploaded ? 'bg-amber-100' : 'bg-neutral-100';


            return (
                <div 
                    key={index} 
                className="border-3 border-black bg-white p-4 shadow-[5px_5px_0px_#000] md:p-5"
                >
                    {/* Document Header (Icon, Label, Status, Actions) */}
                <div className="mb-4 flex flex-col items-start justify-between gap-3 border-b-2 border-black pb-3 sm:flex-row sm:items-center">
                        {/* ICON & LABEL */}
                  <div className="mb-2 flex flex-grow items-center sm:mb-0">
                    <DocIcon className={`mr-3 flex-shrink-0 text-xl ${iconColor}`} />
                            <label
                                htmlFor={inputName}
                      className="text-base font-black uppercase tracking-[0.08em] text-neutral-950 md:text-lg"
                            >
                                {docName}
                            </label>
                            {/* Display Status Badge on larger screens */}
                            {alreadyUploaded && <div className="hidden md:block ml-4"><StatusBadge status={currentStatus} /></div>}
                        </div>
                        
                        {/* ACTIONS & SMALL-SCREEN STATUS */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Display Status Badge on smaller screens */}
                            {alreadyUploaded && <div className="md:hidden"><StatusBadge status={currentStatus} /></div>}

                            {/* View/Hide Button */}
                            {alreadyUploaded && (
                                <button
                                    type="button"
                                    onClick={() => handlePreviewToggle(bookingId, docName)}
                                    disabled={isEditing[inputName]} 
                                    className={`flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        isSelectedForPreview
                                        ? 'bg-black text-white hover:bg-red-600' 
                                        : 'bg-red-600 text-white hover:bg-black' 
                                    }`}
                                >
                                    {isSelectedForPreview ? <FaEyeSlash /> : <FaEye />}
                                    {isSelectedForPreview ? 'Hide' : 'View'}
                                </button>
                            )}

                            {/* Edit/Cancel Button (Only show if not verified) */}
                            {alreadyUploaded && !isVerified ? (
                                <button
                                    type="button"
                                    onClick={() => handleEditToggle(inputName, docName)}
                                  className={`flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] transition ${
                                        isEditing[inputName] 
                                      ? 'bg-black text-white hover:bg-red-600' 
                                      : 'bg-white text-neutral-950 hover:bg-neutral-950 hover:text-white' 
                                    }`}
                                >
                                    {isEditing[inputName] ? <><FaBan className="inline" />Cancel</> : <><FaEdit className="inline" />Replace</>}
                                </button>
                            ) : (
                                isVerified && alreadyUploaded && (
                                  <div className="flex items-center gap-1.5 border-2 border-black bg-neutral-100 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-neutral-600">
                                    <FaBan className="text-sm" title="Cannot replace verified document" />
                                        <span className="hidden sm:inline">Locked</span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    
                    {/* Admin Denial Comment Display */}
                    {isDenied && denialComment && (
                      <div className="mb-4 border-2 border-black bg-red-100 p-3 text-sm text-red-900">
                        <div className="mb-1 flex items-center text-xs font-black uppercase tracking-[0.1em]">
                          <FaCommentAlt className="mr-2 inline flex-shrink-0 text-red-700" />
                                Admin's Reason for Denial:
                            </div>
                        <p className='ml-5 font-medium'>{denialComment}</p>
                        </div>
                    )}

                    {/* Conditionally render the file input, comment field, or status message */}
                    {showFileInput ? (
                        <>
                            <div className="relative mt-2">
                                <input
                                    type="file"
                                    id={inputName}
                                    name={inputName} 
                                    accept="application/pdf"
                                    key={isEditing[inputName] ? 'editing' : 'not-editing'} 
                                    onChange={(e) => handleFileChange(e, docName)}
                                    className="opacity-0 w-full h-full absolute inset-0 cursor-pointer z-10"
                                />
                                  <div className="flex h-20 items-center justify-center border-2 border-dashed border-black bg-neutral-50 p-4 text-neutral-700 transition-colors hover:bg-red-50">
                                    <FaCloudUploadAlt className="mr-3 text-xl text-red-600" />
                                    <span className="text-xs font-black uppercase tracking-[0.08em]">
                                        {fileItem ? `Selected: ${fileItem.name}` : `Drag & Drop or Click to Upload PDF for ${docName}`}
                                    </span>
                                </div>
                            </div>
                            
                            {/* File Preview */}
                            <FilePreview fileItem={fileItem} />

                            {/* NEW: Tenant Comment Field (Appears only if a file is selected) */}
                            {fileItem && (
                              <div className="mt-4 border-2 border-black bg-neutral-50 p-3">
                                <label htmlFor={`comment-${inputName}`} className="mb-2 flex items-center text-xs font-black uppercase tracking-[0.08em] text-neutral-700">
                                  <FaInfoCircle className='mr-2 text-red-600' />
                                        Add a Note for the Administrator (Optional):
                                    </label>
                                    <textarea
                                        id={`comment-${inputName}`}
                                        value={uploadComment[inputName] || ''}
                                        onChange={(e) => setUploadComment(prev => ({ ...prev, [inputName]: e.target.value }))}
                                        placeholder={isDenied ? "Explaining how you fixed the issue will speed up the review." : "Any relevant details about this document."}
                                        rows="2"
                                  className="w-full border-2 border-black bg-white p-2 text-sm text-neutral-900 outline-none focus:border-red-600"
                                    />
                                    {/* The actual data for the comment is appended in handleSubmit */}
                                </div>
                            )}
                        </>
                    ) : (
                          <p className={`mt-2 border-2 border-black p-3 text-sm font-semibold ${messageColor} ${messageBgColor}`}>
                            {statusMessage}
                        </p>
                    )}
                </div>
            );
        })}
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isSubmitEnabled}
        className={`flex w-full items-center justify-center space-x-2 border-2 border-black px-4 py-3 text-sm font-black uppercase tracking-[0.14em] transition ${
            isSubmitEnabled 
            ? 'bg-red-600 text-white shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:bg-black hover:shadow-[2px_2px_0px_#000]'
            : 'cursor-not-allowed bg-neutral-300 text-neutral-500'
        }`}
      >
        {isLoading ? (
            <FaSpinner className="animate-spin text-lg" />
        ) : (
            <FaArrowUp className="text-lg" />
        )}
        {isLoading ? 'Uploading...' : 'Upload Selected Documents'}
      </button>
    </form>
  );
};

export default UploadDocuments;