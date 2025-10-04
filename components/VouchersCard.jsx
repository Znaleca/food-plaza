'use client';

import React, { useState, useEffect } from 'react';
import {
  FaPercent,
  FaStore,
  FaCalendarAlt,
  FaMoneyBillWave
} from 'react-icons/fa';
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
    return date.toLocaleDateString('en-PH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  

  const now = new Date();

  // Voucher timing states
  const startDate = voucher.valid_from ? new Date(voucher.valid_from) : null;
  const endDate = voucher.valid_to ? new Date(voucher.valid_to) : null;

  const isComingSoon = startDate && now < startDate;
  const isActive = startDate && endDate && now >= startDate && now <= endDate;
  const isExpired = endDate && now > endDate;

  // Remaining vouchers
  const claimedUsersCount = voucher.claimed_users?.length || 0;
  const totalQuantity = voucher.quantity || 0;
  const remainingVouchers = totalQuantity - claimedUsersCount;
  const isSoldOut = remainingVouchers <= 0;
  const claimedPercentage =
    totalQuantity > 0 ? (claimedUsersCount / totalQuantity) * 100 : 0;

  // Hide expired or claimed vouchers
  if (isExpired || claimed) return null;

  return (
    <div
      className={`relative w-full max-w-xs sm:max-w-md mx-auto min-h-64 bg-neutral-950 text-white rounded-2xl shadow-xl border border-neutral-800 overflow-hidden transition-all duration-300
      ${isSoldOut || isComingSoon ? 'opacity-60' : 'hover:scale-105 hover:shadow-cyan-500/20'}`}
    >
      {/* Overlay */}
      {(isSoldOut || isComingSoon) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-60 text-white rounded-2xl">
          <p className="text-xl sm:text-2xl font-extrabold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            {isComingSoon ? 'Coming Soon' : 'Sold Out'}
          </p>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Top Section */}
        <div className="flex flex-col items-center pb-4 border-b border-neutral-800">
          <div className="flex items-center justify-center w-14 h-14 mb-3 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full shadow-lg">
            <FaPercent className="text-white text-2xl" />
          </div>
          <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-center">
            {voucher.discount || 'N/A'}% OFF
          </h3>
          <p className="text-lg font-semibold mt-1 text-center">{voucher.title || 'Voucher Title'}</p>
          {voucher.description && (
            <p className="mt-2 text-gray-400 text-sm italic text-center max-w-[90%]">
              {voucher.description}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col space-y-3 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FaStore className="text-cyan-400" />
            <span>
              <strong className="text-white">Stall:</strong> {stallName}
            </span>
          </div>
          {voucher.valid_from && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FaCalendarAlt className="text-cyan-400" />
              <span>
                <strong className="text-white">Valid From:</strong>{' '}
                {formatDate(voucher.valid_from)}
              </span>
            </div>
          )}
          {voucher.valid_to && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FaCalendarAlt className="text-fuchsia-400" />
              <span>
                <strong className="text-white">Valid Until:</strong>{' '}
                {formatDate(voucher.valid_to)}
              </span>
            </div>
          )}
          {voucher.min_orders !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FaMoneyBillWave className="text-green-400" />
              <span>
                <strong className="text-white">Min. Order:</strong>{' '}
                {voucher.min_orders === 0 ? 'No Minimum Spend' : `₱${voucher.min_orders}`}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isActive && !isSoldOut && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-cyan-400">{remainingVouchers} left</span>
              <span className="text-gray-400">
                {claimedUsersCount} / {totalQuantity} claimed
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${claimedPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Claim Button */}
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
              {isComingSoon ? 'Coming Soon' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VouchersCard;
