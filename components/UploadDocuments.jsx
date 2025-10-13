'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
// NOTE: Assuming your action file is correctly located at this path
import updateDocuments from '@/app/actions/updateDocuments'; 
import { useState } from 'react';
import { 
    FaCheckCircle, 
    FaTimesCircle, 
    FaFileAlt, // The file icon we'll use for verified status now
    FaEye, 
    FaEyeSlash, 
    FaEdit, 
    FaBan, 
    FaSpinner,
    FaArrowUp,
    FaHourglassHalf,
    FaCloudUploadAlt 
} from 'react-icons/fa';

// Helper function to render status badge with icons (no change needed here)
const StatusBadge = ({ status }) => {
    let Icon = FaHourglassHalf; 
    let color = 'text-yellow-400';
    let bgColor = 'bg-yellow-400/10';
    let label = 'Submitted';
    
    const normalizedStatus = status ? status.toLowerCase() : 'submitted'; 

    switch (normalizedStatus) {
      case 'verified':
      case 'approved':
        Icon = FaCheckCircle;
        color = 'text-green-400';
        bgColor = 'bg-green-400/10';
        label = 'Verified';
        break;
      case 'denied':
      case 'rejected':
        Icon = FaTimesCircle;
        color = 'text-red-500';
        bgColor = 'bg-red-500/10';
        label = 'Denied';
        break;
      case 'submitted':
      case 'pending':
      default:
        Icon = FaHourglassHalf; 
        color = 'text-yellow-400';
        bgColor = 'bg-yellow-400/10';
        label = 'Submitted';
        break;
    }

    return (
      <span className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${bgColor} transition-colors duration-200`}>
        <Icon className={`mr-2 ${color}`} />
        <span className={color}>{label}</span>
      </span>
    );
}

// Simple component to display the file name and a link to view the temporary PDF (no change needed here)
const FilePreview = ({ fileItem }) => {
  if (!fileItem) return null;

  return (
    <div className="mt-3 flex justify-between items-center p-4 border-l-4 border-pink-500 bg-neutral-800 rounded-r-lg text-sm transition-all duration-200 shadow-inner">
      <div className="flex items-center truncate">
        <FaFileAlt className="text-pink-500 mr-3 flex-shrink-0 text-lg" />
        <span className="truncate font-medium text-gray-300">
          Ready to Upload: <strong className="text-white">{fileItem.name}</strong>
        </span>
      </div>
      <a 
        href={fileItem.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="ml-4 flex-shrink-0 text-yellow-400 hover:text-yellow-300 font-medium transition-colors border-b border-dashed border-yellow-400/50"
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
  // ... (Hooks and state initialization remain the same)
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isEditing, setIsEditing] = useState({}); 
  const [isLoading, setIsLoading] = useState(false);

  // ... (handleSubmit and handleFileChange remain the same)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(selectedFiles).length === 0) return; 
    
    setIsLoading(true);
    const formData = new FormData(e.target);

    const res = await updateDocuments(bookingId, formData, requiredDocuments); 

    Object.values(selectedFiles).forEach(item => {
        if (item.url) {
            URL.revokeObjectURL(item.url);
        }
    });
    setSelectedFiles({}); 
    setIsEditing({}); 
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
    } else {
      setSelectedFiles(prev => {
        const newState = { ...prev };
        delete newState[inputName];
        return newState;
      });
    }
  };

  // ... (handleEditToggle remains the same)
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
      className="space-y-6 w-full p-6 bg-neutral-900 border border-pink-600/30 rounded-xl shadow-2xl font-sans"
    >
      <h3 className="text-2xl font-extrabold text-white mb-6 border-b border-neutral-700 pb-3">
        Lessee Documentation
      </h3>
      
      <div className="space-y-5">
        {requiredDocuments.map((docName, index) => {
            const inputName = docName.toLowerCase().replace(/[^a-z0-9]/g, '_'); 
            const fileItem = selectedFiles[inputName];
            
            const existingDoc = uploadedDocuments.find(doc => doc.name === docName);
            
            const alreadyUploaded = !!existingDoc;
            const currentStatus = existingDoc?.status || 'submitted'; 
            
            const normalizedStatus = currentStatus.toLowerCase();
            const isVerified = normalizedStatus === 'verified' || normalizedStatus === 'approved';
            const isDenied = normalizedStatus === 'denied' || normalizedStatus === 'rejected';
            
            const showFileInput = !alreadyUploaded || isEditing[inputName];
            
            const isSelectedForPreview = isBookingPreviewOpen && activePreviewDoc === docName;

            let DocIcon = FaFileAlt;
            let iconColor = 'text-gray-500';

            // --- MODIFIED LOGIC HERE: Remove FaCheckCircle for 'verified' ---
            if (alreadyUploaded) {
                if (isVerified) {
                    DocIcon = FaFileAlt; // Use the standard file icon for verified
                    iconColor = 'text-green-500'; // Keep the color green
                } else if (isDenied) {
                    DocIcon = FaTimesCircle;
                    iconColor = 'text-red-500';
                } else {
                    DocIcon = FaHourglassHalf;
                    iconColor = 'text-yellow-500';
                }
            }
            // ----------------------------------------------------------------

            const statusMessage = isVerified 
                ? "Your document is **Verified**. Replacement is not permitted."
                : isDenied 
                ? "Review failed. Please review the requirement and click 'Replace' to upload a new file."
                : alreadyUploaded 
                ? "Document submitted successfully. Waiting for administrator review."
                : "Required: Please upload the document to proceed with the lease request.";

            const messageColor = isVerified ? 'text-green-400' : isDenied ? 'text-red-400' : alreadyUploaded ? 'text-yellow-400' : 'text-gray-400';
            const messageBgColor = isVerified ? 'bg-green-900/20' : isDenied ? 'bg-red-900/20' : alreadyUploaded ? 'bg-yellow-900/20' : 'bg-neutral-800';


            return (
                <div 
                    key={index} 
                    className="p-5 bg-neutral-800 rounded-xl border border-neutral-700 shadow-md hover:border-pink-600/50 transition-all duration-200"
                >
                    {/* Document Header (Icon, Label, Status, Actions) */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-neutral-700/50 pb-3">
                        {/* ICON & LABEL */}
                        <div className="flex items-center flex-grow mb-3 sm:mb-0">
                            <DocIcon className={`text-2xl mr-3 ${iconColor} flex-shrink-0`} />
                            <label
                                htmlFor={inputName}
                                className="text-lg font-bold text-white leading-tight"
                            >
                                {docName}
                            </label>
                            {/* Display Status Badge on larger screens */}
                            {alreadyUploaded && <div className="hidden md:block ml-4"><StatusBadge status={currentStatus} /></div>}
                        </div>
                        
                        {/* ACTIONS & SMALL-SCREEN STATUS */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Display Status Badge on smaller screens */}
                            {alreadyUploaded && <div className="md:hidden"><StatusBadge status={currentStatus} /></div>}

                            {/* View/Hide Button */}
                            {alreadyUploaded && (
                                <button
                                    type="button"
                                    onClick={() => handlePreviewToggle(bookingId, docName)}
                                    // Disable if currently editing a file
                                    disabled={isEditing[inputName]} 
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isSelectedForPreview
                                            ? 'bg-red-600 text-white hover:bg-red-500' 
                                            : 'bg-pink-600 text-white hover:bg-pink-500' 
                                    } shadow-md`}
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
                                    className={`text-sm font-semibold py-1.5 px-3 rounded-lg transition duration-200 flex items-center gap-1.5 shadow-md ${
                                        isEditing[inputName] 
                                            ? 'bg-red-600 text-white hover:bg-red-500' 
                                            : 'bg-yellow-600 text-white hover:bg-yellow-500' 
                                    }`}
                                >
                                    {isEditing[inputName] ? <><FaBan className="inline" />Cancel</> : <><FaEdit className="inline" />Replace</>}
                                </button>
                            ) : (
                                isVerified && alreadyUploaded && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-500">
                                        <FaBan className="text-lg" title="Cannot replace verified document" />
                                        <span className="hidden sm:inline">Locked</span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Conditionally render the file input or status message */}
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
                                <div className="flex items-center justify-center h-20 border-2 border-dashed border-pink-500/50 bg-neutral-800 rounded-lg text-gray-400 hover:border-pink-500 transition-colors duration-200 p-4">
                                    <FaCloudUploadAlt className="text-2xl mr-3 text-pink-500" />
                                    <span className="font-medium text-sm">
                                        {fileItem ? `Selected: ${fileItem.name}` : `Drag & Drop or Click to Upload PDF for ${docName}`}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Preview Section */}
                            <FilePreview fileItem={fileItem} />
                        </>
                    ) : (
                        <p className={`text-sm italic mt-2 p-3 rounded-lg font-medium transition-colors duration-200 ${messageColor} ${messageBgColor}`}>
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
        className={`w-full py-3.5 px-4 text-xl font-extrabold rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
            isSubmitEnabled 
            ? 'bg-pink-600 text-white hover:bg-pink-500 shadow-pink-600/50 transform hover:scale-[1.01]'
            : 'bg-neutral-700 text-gray-500 cursor-not-allowed'
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