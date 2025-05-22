'use client';

import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaPercent } from 'react-icons/fa';
import DeletePromosButton from './DeletePromosButton';

const PromosCard = ({ promo, onDelete }) => {
  const [isDeleted, setIsDeleted] = useState(false);

  if (!promo || isDeleted) return null;

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
      className={`relative w-full max-w-md mx-auto p-4 bg-neutral-900 text-white rounded-lg shadow-md border-2 border-pink-600 transition-all duration-300 
      ${!isActive ? 'opacity-60' : 'hover:shadow-lg'}`}
    >
      {/* "Expired" Overlay */}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-4xl font-semibold opacity-40 pointer-events-none">
          EXPIRED
        </div>
      )}

      {/* Promo Icon */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 flex items-center justify-center bg-neutral-700 rounded-full">
          <FaPercent className="text-white text-2xl" />
        </div>

        {/* Promo Details */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{promo.title || 'Promo Title'}</h3>
          <p className="text-sm text-pink-400">{promo.discount || 'N/A'}% OFF</p>
          <div className="mt-1 flex flex-col text-sm text-gray-400">
            <span><strong>Valid From:</strong> {formatDate(promo.valid_from)}</span>
            <span><strong>Valid To:</strong> {formatDate(promo.valid_to)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {promo.description && (
        <p className="mt-2 text-gray-400 text-xs italic">{promo.description}</p>
      )}

      {/* Status (Active/Expired) */}
      <div className="mt-3 flex items-center space-x-3">
        {isActive ? (
          <FaCheckCircle className="text-green-500 text-lg" />
        ) : (
          <FaTimesCircle className="text-red-500 text-lg" />
        )}
        <span className={`text-sm ${isActive ? 'text-green-400' : 'text-red-400'}`}>
          {isActive ? 'Active' : 'Expired'}
        </span>
      </div>

      {/* Delete Button (for Admins) */}
      <div className="mt-4 text-right">
        <DeletePromosButton promoId={promo.$id} onDelete={() => setIsDeleted(true)} />
      </div>
    </div>
  );
};

export default PromosCard;
