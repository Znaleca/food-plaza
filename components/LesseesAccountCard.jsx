'use client';

import React from 'react';
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

const LesseesAccountCard = ({ lessee }) => {
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
  } = lessee;

  const leasePeriod = check_in && check_out
    ? `${formatDate(check_in)} - ${formatDate(check_out)}` // Use a shorter separator
    : 'Not Set';

  return (
    // Reduced padding (p-4), smaller rounded corners (rounded-lg)
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
  );
};

export default LesseesAccountCard;