'use client';

import React, { useState } from 'react';
import { 
  FaStore, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaRulerCombined, 
  FaHome, 
  FaPhone, 
  FaLink, 
  FaVenusMars,
  FaUser, 
  FaClock, 
  FaIdCard, // For Valid ID icon
  FaTimes, // NEW: For modal close button
  FaEye, // NEW: For "View" icon in button
  FaTag, // NEW: For ID Type icon
} from 'react-icons/fa';

// Helper function to format dates for display (remains the same)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

// Helper function to get the Valid ID image URL from Appwrite storage
const getValidIDImageUrl = (fileId) => {
  if (!fileId) return null;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  if (!projectId || !bucketId) {
    console.warn('Missing Appwrite env vars for image URL');
    return null;
  }
  // Appwrite storage preview URL (admin mode for dashboard viewing)
  return `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}&mode=admin`;
};

// MODIFIED: Simplified DataRow for a smaller footprint
// Added an optional 'valueTextSize' prop for customization
const CompactDataRow = ({ icon: Icon, label, value, isLink = false, valueTextSize = 'text-sm' }) => (
  // Reduced vertical padding (py-1), smaller text (text-xs/sm), smaller icon size
  <div className="flex items-center py-1"> 
    {/* Smaller icon container and text-base icon size */}
    <div className="p-1 bg-pink-100 rounded-md mr-3 flex-shrink-0">
      <Icon className="text-pink-600 text-base" /> 
    </div>
    <div className="flex flex-col overflow-hidden">
      {/* Smaller, lighter label text */}
      <span className="font-semibold text-gray-500 text-xs uppercase tracking-tight truncate">{label}</span> 
      {isLink && value !== 'N/A' ? (
        <a
          href={value.startsWith('http') ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 underline font-medium text-sm truncate" // Smaller link text
        >
          View Link
        </a>
      ) : (
        // Uses the new valueTextSize prop
        <span className={`text-gray-800 font-medium truncate ${valueTextSize}`}>{value}</span> 
      )}
    </div>
  </div>
);

// NEW: Modal Component for Valid ID Image
const ValidIDModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose(); // Close on backdrop click
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose(); // Close on Esc key
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label="Valid ID Image Modal"
      tabIndex={-1}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Close modal"
        >
          <FaTimes />
        </button>
        {imageUrl ? (
          <div className="flex justify-center items-center h-96">
            <img
              src={imageUrl}
              alt="Valid ID"
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <p className="hidden text-gray-500 text-center">Image could not be loaded. Please check the file ID.</p>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No image available to display.</p>
        )}
      </div>
    </div>
  );
};

const LesseesAccountCard = ({ lessee }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // NEW: State for modal

  if (!lessee) {
    return (
      <div className="bg-white border border-pink-300 rounded-lg p-4 text-center text-gray-800 shadow-md">
        <p className="text-gray-500 text-sm">No lessee data available.</p>
      </div>
    );
  }

  const {
    fname = 'Unknown Tenant',
    gender = 'N/A',
    residentialAddress = 'N/A',
    phoneNumber = 'N/A',
    socialMediaAccount = 'N/A',
    stallNumber = 'Unassigned',
    stallName = 'Unassigned Stall',
    check_in = null,
    check_out = null,
    email = 'No Email Provided', 
    createdAt = null,
    validID = null, // Valid ID file ID
    idType = 'N/A', // NEW: Destructure idType
  } = lessee;

  const leasePeriod = check_in && check_out
    ? `${formatDate(check_in)} - ${formatDate(check_out)}` // Use a shorter separator
    : 'Not Set';

  // Get image URL for validID
  const validIDImageUrl = getValidIDImageUrl(validID);

  // NEW: Open modal handler
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-800 shadow-lg hover:shadow-xl hover:border-pink-400 transition-all duration-300 ease-in-out">

        {/* 1. Primary Tenant Details - Reduced vertical margin/padding */}
        <div className="pb-3 border-b border-gray-200">
          {/* CHANGED: items-center to items-start for top alignment */}
          <div className="flex items-start mb-3"> 
              {/* INCREASED: User icon size from text-3xl to text-4xl */}
              <FaUser className="text-4xl text-pink-600 mr-3 flex-shrink-0" /> 
              {/* INCREASED: Name text size from text-xl to text-2xl */}
              {/* MODIFIED: REMOVED 'truncate' and ADDED 'break-words' to allow text to wrap */}
              <h4 className="text-2xl font-black text-pink-700 tracking-wide break-words"> 
                  {fname.toUpperCase()}
              </h4>
          </div>
          
          {/* All CompactDataRows in a 2-column grid to save vertical space */}
          <div className="grid grid-cols-2 gap-y-1 gap-x-4">
              <CompactDataRow
                  icon={FaVenusMars}
                  label="Gender"
                  value={gender}
              />
              <CompactDataRow
                  icon={FaPhone}
                  label="Phone Number"
                  value={phoneNumber}
              />
              {/* Address takes full width and uses the larger text size */}
              <div className="col-span-2"> 
                  <CompactDataRow
                      icon={FaHome}
                      label="Residential Address"
                      value={residentialAddress}
                      valueTextSize="text-base" // INCREASED: Text size for the address
                  />
              </div>
              <div className="col-span-2"> {/* Social Media takes full width */}
                  <CompactDataRow
                      icon={FaLink}
                      label="Social Media"
                      value={socialMediaAccount}
                      isLink={true}
                  />
              </div>
          </div>
        </div>

        {/* MODIFIED: Valid ID Section - Now includes ID Type and "View Valid ID" button */}
        <div className="py-3 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <FaIdCard className="text-pink-600 mr-2 text-xl flex-shrink-0" />
            <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Valid ID Details</h5>
          </div>
          
          {/* NEW: ID Type Row */}
          <div className="pl-4">
            <CompactDataRow 
                icon={FaTag} // Using FaTag for the ID Type
                label="ID Type"
                value={idType}
                valueTextSize="text-sm font-semibold"
            />
          </div>

          {/* View Button */}
          <div className="mt-3">
              {validIDImageUrl ? (
                <button
                  onClick={openModal}
                  className="flex items-center justify-center w-full px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 font-medium rounded-md transition-colors duration-200 text-sm"
                >
                  <FaEye className="mr-2" />
                  View Valid ID Image
                </button>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No Valid ID image available.</p>
              )}
          </div>
        </div>

        {/* 2. Stall / Lease Info - Reduced vertical margin/padding and font sizes */}
        <div className="flex flex-col items-center justify-center pt-3 mt-3 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-tight mb-1">
            Assigned Stall
          </h4>
          {/* Smaller icon and text size */}
          <FaStore className="text-pink-600 text-3xl mb-2" /> 
          <h3 className="text-2xl font-extrabold text-gray-800 leading-tight">
            STALL <span className="text-pink-600">#{stallNumber}</span>
          </h3>
          <p className="text-base text-gray-700 font-medium mt-0.5">{stallName}</p>
          <div className="w-12 h-0.5 bg-pink-600 rounded-full my-3" /> {/* Smaller separator */}
          
          {/* Lease Period - Compacted onto one line, smaller font */}
          <p className="flex items-center text-xs sm:text-sm text-center">
            {/* Using FaCalendarAlt */}
            <FaCalendarAlt className="text-yellow-600 mr-2 flex-shrink-0 text-base" /> 
            <span className="font-semibold text-gray-800 mr-1">Lease:</span>
            <span className="text-gray-700 break-words">{leasePeriod}</span>
          </p>
        </div>

        {/* 3. Footer / Account Info - Reduced vertical margin/padding and font sizes */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600 text-center space-y-1"> 
          <p className="flex items-center justify-center">
            <FaEnvelope className="text-gray-500 mr-1.5 flex-shrink-0 text-sm" /> 
            <span className="font-semibold text-gray-600 mr-1">Email:</span> 
            <span className="text-gray-700 break-words truncate">{email}</span> 
          </p>
          <p className="flex items-center justify-center">
            {/* CHANGED: Replaced FaCalendarAlt with FaClock for a better "Joined" icon */}
            <FaClock className="text-gray-500 mr-1.5 flex-shrink-0 text-sm" /> 
            <span className="font-semibold text-gray-600 mr-1">Joined:</span> 
            <span className="text-gray-700 break-words">{formatDate(createdAt)}</span> 
          </p>
        </div>
      </div>

      {/* NEW: Render the Modal */}
      <ValidIDModal
        isOpen={isModalOpen}
        onClose={closeModal}
        imageUrl={validIDImageUrl}
      />
    </>
  );
};

export default LesseesAccountCard;