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
      className={`relative w-full max-w-xl h-52 mx-auto bg-neutral-900 text-white rounded-2xl shadow-xl border-2 border-pink-600 overflow-hidden transition-all duration-300 
      ${isSoldOut ? 'opacity-60' : 'hover:scale-105 hover:shadow-2xl'}`}
    >
      {/* Overlay for sold-out state */}
      {isSoldOut && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-2xl">
          <p className="text-2xl font-extrabold tracking-wide uppercase">Sold Out</p>
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
            {voucher.discount || 'N/A'}% OFF
          </h3>
          <p className="text-lg font-semibold mt-1 text-center">{voucher.title || 'Voucher Title'}</p>
          {voucher.description && (
            <p className="mt-2 text-gray-400 text-xs italic text-center max-w-[90%]">
              {voucher.description}
            </p>
          )}
        </div>

        {/* Right Section: Details and Action */}
        <div className="flex flex-col justify-between flex-1 p-4 space-y-2">
          <div className="flex flex-col space-y-1 text-sm">
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

          <div>
            {isActive && !isSoldOut ? (
              isAuthenticated ? (
                <button
                  onClick={handleClaim}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold w-full transition-colors text-sm"
                >
                  Claim Voucher
                </button>
              ) : (
                <Link
                  href="/login"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold w-full text-center transition-colors text-sm block"
                >
                  Sign in to claim
                </Link>
              )
            ) : (
              <button className="bg-neutral-800 text-gray-500 px-4 py-2 rounded-lg font-semibold w-full cursor-not-allowed text-sm">
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
