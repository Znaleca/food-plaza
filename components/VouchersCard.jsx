'use client';

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaPercent } from 'react-icons/fa';
import VoucherClaimingButton from './VoucherClaimingButton';

const VouchersCard = ({ voucher, onClaim }) => {
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const claimedVouchers = JSON.parse(localStorage.getItem('claimedVouchers')) || {};
    if (claimedVouchers[voucher.$id]) {
      setClaimed(true);
    }
  }, [voucher.$id]);

  const handleClaim = () => {
    setClaimed(true);

    const claimedVouchers = JSON.parse(localStorage.getItem('claimedVouchers')) || {};
    claimedVouchers[voucher.$id] = true;
    localStorage.setItem('claimedVouchers', JSON.stringify(claimedVouchers));

    if (onClaim) onClaim(voucher.$id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const isActive = new Date(voucher.valid_to).setHours(23, 59, 59, 999) >= new Date();
  const isUsed = claimed;

  if (!voucher || claimed) return null;

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

      {/* Voucher Icon */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 flex items-center justify-center bg-neutral-700 rounded-full">
          <FaPercent className="text-white text-2xl" />
        </div>

        {/* Voucher Details */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{voucher.title || 'Voucher Title'}</h3>
          <p className="text-sm text-pink-400">{voucher.discount || 'N/A'}% OFF</p>
          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-400">
            <span><strong>Valid From:</strong> {formatDate(voucher.valid_from)}</span>
            <span><strong>Valid To:</strong> {formatDate(voucher.valid_to)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {voucher.description && (
        <p className="mt-2 text-gray-400 text-xs italic">{voucher.description}</p>
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

      {/* Claim Button */}
      {isActive && (
        <div className="mt-4">
          <VoucherClaimingButton voucherId={voucher.$id} onClaim={handleClaim} />
        </div>
      )}
    </div>
  );
};

export default VouchersCard;
