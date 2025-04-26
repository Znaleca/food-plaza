'use client';

import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DeletePromosButton from './DeletePromosButton';

const PromosCard = ({ promo, onDelete }) => {
  const [isDeleted, setIsDeleted] = useState(false);

  if (!promo || isDeleted) {
    return null;
  }

  const imageSrc = '/images/percentage.jpg';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const isActive = new Date(promo.valid_to).setHours(23, 59, 59, 999) >= new Date();

  return (
    <div 
      className={`relative w-full max-w-md p-3 bg-white text-gray-900 border-2 border-yellow-400 rounded-lg shadow-lg flex items-center justify-between transform hover:scale-105 transition-all duration-300 
        ${!isActive ? 'opacity-50' : ''}`} // Makes expired cards look disabled
    >
      {/* Expired Watermark */}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-5xl font-bold opacity-20 pointer-events-none">
          EXPIRED
        </div>
      )}

      {/* Strikethrough Effect */}
      {!isActive && (
        <div className="absolute inset-0 w-full h-full border-t-4 border-b-4 border-gray-500 rotate-[-5deg] opacity-50 pointer-events-none"></div>
      )}

      {/* Promo Image */}
      <div className="w-24 h-24 bg-cover bg-center mr-4" style={{ backgroundImage: `url(${imageSrc})` }}></div>
      
      {/* Promo Content */}
      <div className="flex flex-col flex-grow border-l-4 border-blue-400 pl-4">
        {/* Promo Header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-bold text-gray-800">{promo.title || 'Promo Title'}</h3>
          <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-800 rounded-full">
            {promo.discount || 'N/A'}% OFF
          </span>
        </div>

        {/* Promo Details */}
        <div className="text-xs text-gray-700">
          <p><span className="font-semibold">Valid From:</span> {formatDate(promo.valid_from)}</p>
          <p><span className="font-semibold">Valid To:</span> {formatDate(promo.valid_to)}</p>
        </div>
        
        {/* Description */}
        {promo.description && (
          <p className="mt-2 text-gray-600 text-xs italic">{promo.description}</p>
        )}

        {/* Status */}
        <div className="mt-2 flex items-center space-x-2 text-xs font-bold">
          {isActive ? (
            <FaCheckCircle className="text-green-400" />
          ) : (
            <FaTimesCircle className="text-red-400" />
          )}
          <span className={isActive ? 'text-green-600' : 'text-red-600'}>{isActive ? 'Active' : 'Expired'}</span>
        </div>
      </div>
      
      {/* Delete Button */}
      <div className="ml-4">
        <DeletePromosButton promoId={promo.$id} onDelete={() => setIsDeleted(true)} />
      </div>
    </div>
  );
};

export default PromosCard;
