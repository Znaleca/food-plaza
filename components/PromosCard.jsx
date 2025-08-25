'use client';

import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaPercent, FaStore } from 'react-icons/fa';
import DeletePromosButton from './DeletePromosButton';
import getRoomByUserId from '@/app/actions/getRoomByUserId';

const PromosCard = ({ promo }) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [stallName, setStallName] = useState('');

  useEffect(() => {
    (async () => {
      if (promo?.user_id) {
        const room = await getRoomByUserId(promo.user_id);
        setStallName(room?.name || 'Unknown Stall');
      }
    })();
  }, [promo?.user_id]);

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
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-4xl font-semibold opacity-40 pointer-events-none">
          EXPIRED
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 flex items-center justify-center bg-neutral-700 rounded-full">
          <FaPercent className="text-white text-2xl" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold">{promo.title || 'Promo Title'}</h3>
          <p className="text-sm text-pink-400">{promo.discount || 'N/A'}% OFF</p>
          <div className="mt-1 flex flex-col text-sm text-gray-400">
            <span><strong>Valid From:</strong> {formatDate(promo.valid_from)}</span>
            <span><strong>Valid To:</strong> {formatDate(promo.valid_to)}</span>
            <span className="flex items-center gap-2 mt-1 text-blue-400">
              <FaStore /> <strong>Food Stall:</strong> {stallName}
            </span>
          </div>
        </div>
      </div>

      {promo.description && (
        <p className="mt-2 text-gray-400 text-xs italic">{promo.description}</p>
      )}

      {/* ✅ Minimum Order Requirement */}
      {promo.min_orders && (
        <p className="mt-1 text-sm text-yellow-400">
          Minimum Order: ₱{promo.min_orders}
        </p>
      )}

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

      <div className="mt-4 text-right">
        <DeletePromosButton promoId={promo.$id} onDelete={() => setIsDeleted(true)} />
      </div>
    </div>
  );
};

export default PromosCard;
