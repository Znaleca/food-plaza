'use client';

import React, { useState } from 'react';
import { 
  FaPercent, 
  FaStore, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaInfoCircle 
} from 'react-icons/fa';
import DeletePromosButton from './DeletePromosButton';

const PromosCard = ({ promo, stallName }) => {
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
      className={`relative w-full max-w-xl min-h-52 mx-auto bg-neutral-900 text-white 
                  rounded-2xl shadow-xl border-2 border-pink-600 overflow-hidden 
                  transition-all duration-300
                  ${!isActive ? 'opacity-60' : 'hover:scale-105 hover:shadow-2xl'}`}
    >
      {/* Overlay for expired state */}
      {!isActive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-2xl">
          <p className="text-2xl font-extrabold tracking-wide uppercase">Expired</p>
        </div>
      )}

      {/* Main landscape content container */}
      <div className="relative z-10 flex h-full">
        {/* Left Section: Main Discount */}
        <div className="flex flex-col items-center justify-center flex-1 p-4 border-r border-neutral-700">
          <div className="flex items-center justify-center w-16 h-16 mb-2 bg-pink-600 rounded-full">
            <FaPercent className="text-white text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-pink-400 text-center leading-tight">
            {promo.discount || 'N/A'}% OFF
          </h3>
          <p className="text-lg font-semibold mt-1 text-center">{promo.title || 'Promo Title'}</p>
          {promo.description && (
            <p className="mt-2 text-gray-400 text-xs italic text-center max-w-[90%]">
              {promo.description}
            </p>
          )}
        </div>

        {/* Right Section: Details and Action */}
        <div className="flex flex-col justify-between flex-1 p-4 space-y-2">
          <div className="flex flex-col space-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <FaStore className="text-blue-400" />
              <span>
                <strong className="text-white font-medium">Stall:</strong> {stallName || 'Unknown Stall'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <FaCalendarAlt className="text-green-400" />
              <span>
                <strong className="text-white font-medium">Valid From:</strong> {formatDate(promo.valid_from)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <FaCalendarAlt className="text-white" />
              <span>
                <strong className="text-white font-medium">Valid Until:</strong> {formatDate(promo.valid_to)}
              </span>
            </div>

            {promo.min_orders && (
              <div className="flex items-center gap-2 text-gray-400">
                <FaMoneyBillWave className="text-yellow-400" />
                <span>
                  <strong className="text-white font-medium">Min. Order:</strong> ₱{promo.min_orders}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-400">
              <FaInfoCircle className="text-pink-400" />
              <span>
                <strong className="text-white font-medium">Quantity:</strong> {promo.quantity || 'N/A'}
              </span>
            </div>
          </div>

          {/* Button aligned like voucher claiming button */}
          <div>
            {isActive ? (
              <DeletePromosButton promoId={promo.$id} onDelete={() => setIsDeleted(true)} />
            ) : (
              <button className="bg-neutral-800 text-gray-500 px-4 py-2 rounded-lg font-semibold w-full cursor-not-allowed text-sm">
                Expired
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromosCard;
