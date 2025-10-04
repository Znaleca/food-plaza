'use client';

import React from 'react';
import { FaPercent, FaCalendarAlt, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';

const ClaimedVoucherCard = ({ voucher, redeemed = false }) => {
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
  const endDate = voucher.valid_to ? new Date(voucher.valid_to) : null;
  const isExpired = endDate && now > endDate;

  let statusText = 'Claimed';
  if (isExpired) statusText = 'Expired';
  else if (redeemed) statusText = 'Used';

  return (
    <div
      className={`relative w-full max-w-xs sm:max-w-md mx-auto bg-neutral-950 text-white rounded-2xl shadow-xl border border-neutral-800 overflow-hidden transition-all duration-300
        ${
          isExpired
            ? 'opacity-60 pointer-events-none'
            : redeemed
            ? 'opacity-70 grayscale pointer-events-none'
            : 'hover:scale-105 hover:shadow-cyan-500/20 cursor-pointer'
        }`}
    >
      {/* Expired Overlay */}
      {isExpired && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-70 rounded-2xl">
          <p className="text-xl font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            Expired
          </p>
        </div>
      )}

      {/* Used Badge */}
      {redeemed && !isExpired && (
        <div className="absolute top-3 right-3 bg-fuchsia-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow">
          <FaCheckCircle className="text-white" /> Used
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
          <p className="text-lg font-semibold mt-1 text-center">{voucher.title}</p>
          {voucher.description && (
            <p className="mt-2 text-gray-400 text-sm italic text-center max-w-[90%]">
              {voucher.description}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col space-y-3 py-4 text-sm text-gray-400">
          {voucher.valid_from && (
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-cyan-400" />
              <span>
                <strong className="text-white">Valid From:</strong> {formatDate(voucher.valid_from)}
              </span>
            </div>
          )}
          {voucher.valid_to && (
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-fuchsia-400" />
              <span>
                <strong className="text-white">Valid Until:</strong> {formatDate(voucher.valid_to)}
              </span>
            </div>
          )}
          {voucher.min_orders !== undefined && (
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-green-400" />
              <span>
                <strong className="text-white">Min. Order:</strong>{' '}
                {voucher.min_orders === 0 ? 'No Minimum Spend' : `₱${voucher.min_orders}`}
              </span>
            </div>
          )}

          {/* If redeemed, show history info */}
          {redeemed && voucher.redeemedAt && (
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-fuchsia-400" />
              <span>
                <strong className="text-white">Used On:</strong> {formatDate(voucher.redeemedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Status Button */}
        <div className="pt-4">
          <button
            disabled
            className={`px-4 py-2 rounded-lg font-semibold w-full text-sm ${
              isExpired
                ? 'bg-neutral-800 text-gray-500 cursor-not-allowed'
                : redeemed
                ? 'bg-fuchsia-500 text-white cursor-default'
                : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white cursor-default'
            }`}
          >
            {statusText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimedVoucherCard;
