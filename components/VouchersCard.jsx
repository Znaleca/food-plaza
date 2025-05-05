'use client';

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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

  if (!voucher || claimed) return null;

  const imageSrc = '/images/percentage.jpg';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isActive = new Date(voucher.valid_to).setHours(23, 59, 59, 999) >= new Date();

  return (
    <div
      className={`relative w-full max-w-sm p-4 bg-white text-gray-800 border-2 border-pink-600 rounded-lg shadow-lg flex items-center justify-between transition-all duration-300 
        ${!isActive ? 'opacity-50' : ''}`}
    >
      {/* Ticket "perforated" effect */}
      <div className="absolute top-1/2 left-0 right-0 -z-10">
        <div className="w-full h-1 bg-gradient-to-r from-transparent to-gray-400 opacity-50">
          <div className="w-full h-1 bg-gray-400 dotted-border"></div>
        </div>
      </div>

      {/* Ticket-like Design: Image Section */}
      <div
        className="w-28 h-28 bg-cover bg-center rounded-md flex-shrink-0"
        style={{ backgroundImage: `url(${imageSrc})` }}
      ></div>

      {/* Voucher Details */}
      <div className="flex flex-col flex-grow pl-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold">{voucher.title || 'Voucher Title'}</h3>
          <span className="px-3 py-1 text-xs font-semibold bg-pink-100 text-pink-600 rounded-full">
            {voucher.discount || 'N/A'}% OFF
          </span>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">From:</span> {formatDate(voucher.valid_from)}</p>
          <p><span className="font-medium">To:</span> {formatDate(voucher.valid_to)}</p>
        </div>

        {voucher.description && (
          <p className="mt-2 text-xs text-gray-600 italic">{voucher.description}</p>
        )}

        <div className="mt-3 flex items-center space-x-2 text-sm">
          {isActive ? (
            <>
              <FaCheckCircle className="text-green-500" />
              <span className="text-green-600 font-medium">Active</span>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-red-400" />
              <span className="text-red-500 font-medium">Expired</span>
            </>
          )}
        </div>

        {isActive && (
          <div className="mt-4">
            <VoucherClaimingButton voucherId={voucher.$id} onClaim={handleClaim} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VouchersCard;
