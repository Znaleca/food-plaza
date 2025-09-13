'use client';

import React, { useState, useEffect } from 'react';
import { FaPercent, FaStore, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import VoucherClaimingButton from './VoucherClaimingButton';

const VouchersCard = ({ voucher, stallName, onClaim }) => {
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

  // Check if the voucher is active
  const isActive = new Date(voucher.valid_to).setHours(23, 59, 59, 999) >= new Date();

  // Calculate remaining vouchers and sold-out status
  const claimedUsersCount = voucher.claimed_users?.length || 0;
  const totalQuantity = voucher.quantity || 0;
  const remainingVouchers = totalQuantity - claimedUsersCount;
  const isSoldOut = remainingVouchers <= 0;
  const claimedPercentage = (claimedUsersCount / totalQuantity) * 100;

  // Don't show the card if the voucher is expired or already claimed
  if (!isActive || claimed) return null;

  return (
    <div
      className={`relative w-full max-w-xs sm:max-w-md mx-auto h-auto min-h-64 bg-neutral-900 text-white rounded-2xl shadow-xl border-2 border-pink-600 overflow-hidden transition-all duration-300
      ${isSoldOut ? 'opacity-60' : 'hover:scale-105 hover:shadow-2xl'}`}
    >
      {/* Overlay for sold-out state */}
      {isSoldOut && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-2xl">
          <p className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase">Sold Out</p>
        </div>
      )}

      {/* Main stacked content container */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Top Section: Main Discount & Title */}
        <div className="flex flex-col items-center pb-4 border-b border-neutral-700">
          <div className="flex items-center justify-center w-14 h-14 mb-2 bg-pink-600 rounded-full">
            <FaPercent className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-pink-400 text-center leading-tight">
            {voucher.discount || 'N/A'}% OFF
          </h3>
          <p className="text-lg font-semibold mt-1 text-center">{voucher.title || 'Voucher Title'}</p>
          {voucher.description && (
            <p className="mt-2 text-gray-400 text-xs italic text-center max-w-[90%]">
              {voucher.description}
            </p>
          )}
        </div>

        {/* Middle Section: Details */}
        <div className="flex flex-col space-y-2 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FaStore className="text-blue-400" />
            <span>
              <strong className="text-white font-medium">Stall:</strong> {stallName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FaCalendarAlt className="text-white" />
            <span>
              <strong className="text-white font-medium">Valid Until:</strong> {formatDate(voucher.valid_to)}
            </span>
          </div>
          {voucher.min_orders && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FaMoneyBillWave className="text-white" />
              <span>
                <strong className="text-white font-medium">Min. Order:</strong> ₱{voucher.min_orders}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Section: Progress and Action */}
        {isActive && !isSoldOut && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-yellow-500">{remainingVouchers} left</span>
              <span className="text-gray-400">{claimedUsersCount} / {totalQuantity} claimed</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2">
              <div
                className="bg-pink-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${claimedPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="pt-4">
          {isActive && !isSoldOut ? (
            <VoucherClaimingButton 
              voucherId={voucher.$id} 
              onClaim={handleClaim} 
              claimedUsersCount={claimedUsersCount}
              quantity={totalQuantity}
            />
          ) : (
            <button className="bg-neutral-800 text-gray-500 px-4 py-2 rounded-lg font-semibold w-full cursor-not-allowed text-sm">
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VouchersCard;