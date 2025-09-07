'use client';

import React, { useState, useEffect } from 'react';
import { FaPercent, FaStore, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import Link from 'next/link';

const VouchersCard = ({ voucher, stallName, onClaim, isAuthenticated }) => {
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
  const claimedUsersCount = voucher.claimed_users?.length || 0;
  const totalQuantity = voucher.quantity || 0;
  const remainingVouchers = totalQuantity - claimedUsersCount;
  const isSoldOut = remainingVouchers <= 0;
  const claimedPercentage = (claimedUsersCount / totalQuantity) * 100;

  if (!isActive || claimed) return null;

  return (
    <div
      className={`relative w-full max-w-md mx-auto bg-neutral-900 text-white rounded-2xl shadow-xl border-2 border-pink-600 overflow-hidden transition-all duration-300 
      ${isSoldOut ? 'opacity-60' : 'hover:scale-105 hover:shadow-2xl'}`}
    >
      {/* Overlay for sold-out */}
      {isSoldOut && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-2xl">
          <p className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase">Sold Out</p>
        </div>
      )}

      {/* Responsive container */}
      <div className="relative z-10 flex flex-col sm:flex-row h-auto">
        {/* Left section */}
        <div className="flex flex-col items-center justify-center flex-1 p-4 border-b sm:border-b-0 sm:border-r border-neutral-700">
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-2 bg-pink-600 rounded-full">
            <FaPercent className="text-white text-2xl sm:text-3xl" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-pink-400 text-center leading-tight">
            {voucher.discount || 'N/A'}% OFF
          </h3>
          <p className="text-base sm:text-lg font-semibold mt-1 text-center">{voucher.title || 'Voucher Title'}</p>
          {voucher.description && (
            <p className="mt-2 text-gray-400 text-xs sm:text-sm italic text-center max-w-[90%]">
              {voucher.description}
            </p>
          )}
        </div>

        {/* Right section */}
        <div className="flex flex-col justify-between flex-1 p-4 space-y-3">
          <div className="flex flex-col space-y-2 text-sm sm:text-base">
            <div className="flex items-center gap-2 text-gray-400">
              <FaStore className="text-blue-400" />
              <span>
                <strong className="text-white font-medium">Stall:</strong> {stallName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <FaCalendarAlt className="text-white" />
              <span>
                <strong className="text-white font-medium">Valid To:</strong> {formatDate(voucher.valid_to)}
              </span>
            </div>
            {voucher.min_orders && (
              <div className="flex items-center gap-2 text-gray-400">
                <FaMoneyBillWave className="text-white" />
                <span>
                  <strong className="text-white font-medium">Min. Order:</strong> ₱{voucher.min_orders}
                </span>
              </div>
            )}
          </div>

          {isActive && !isSoldOut && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs sm:text-sm font-semibold">
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

          <div>
            {isActive && !isSoldOut ? (
              isAuthenticated ? (
                <button
                  onClick={handleClaim}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold w-full transition-colors text-sm sm:text-base"
                >
                  Claim Voucher
                </button>
              ) : (
                <Link
                  href="/login"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold w-full text-center transition-colors text-sm sm:text-base block"
                >
                  Sign in to claim
                </Link>
              )
            ) : (
              <button className="bg-neutral-800 text-gray-500 px-4 py-2 rounded-lg font-semibold w-full cursor-not-allowed text-sm sm:text-base">
                Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VouchersCard;
