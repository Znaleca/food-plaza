'use client';

import React from 'react';
import { FaCalendarAlt, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';

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

  let statusText = 'READY TO USE';
  if (isExpired) statusText = 'EXPIRED';
  else if (redeemed) statusText = 'USED';

  return (
    <div
      className={`relative w-full max-w-xs sm:max-w-md mx-auto bg-white text-neutral-950 border-[6px] border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col
        ${
          isExpired
            ? 'opacity-60 pointer-events-none'
            : redeemed
            ? 'opacity-70 grayscale pointer-events-none bg-neutral-100'
            : 'hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(220,38,38,1)] cursor-pointer'
        }`}
    >
      {/* Overlay for expired/used */}
      {(isExpired || redeemed) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <p className="text-3xl font-black tracking-tighter uppercase border-4 px-4 py-2 bg-white -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
             text-neutral-950 border-neutral-950">
            {isExpired ? 'EXPIRED' : 'USED'}
          </p>
        </div>
      )}

      {/* ── TOP SECTION ── */}
      <div className={`relative z-10 p-6 flex flex-col items-center border-b-[6px] border-neutral-950 text-white ${redeemed ? 'bg-neutral-800' : 'bg-neutral-950'}`}>
        <div className="absolute top-0 left-0 bg-white text-neutral-950 px-3 py-1 font-black text-[10px] tracking-widest uppercase border-r-[6px] border-b-[6px] border-neutral-950">
          MY VOUCHER
        </div>
        
        <h3 className="text-6xl font-black uppercase tracking-tighter leading-none mt-6">
          {voucher.discount || '0'}%<span className="text-3xl">OFF</span>
        </h3>
        <p className="text-lg font-black mt-2 text-center tracking-tight uppercase text-red-400">
          {voucher.title || 'VOUCHER TITLE'}
        </p>
        {voucher.description && (
          <p className="mt-4 text-neutral-400 text-sm font-bold text-center border-t-2 border-neutral-800 pt-4 w-full">
            {voucher.description}
          </p>
        )}
      </div>

      {/* ── DETAILS ── */}
      <div className="flex-1 p-6 flex flex-col justify-between bg-neutral-50">
        <div className="space-y-4">
          {(voucher.valid_from || voucher.valid_to) && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-neutral-950 flex items-center justify-center bg-white">
                <FaCalendarAlt className="text-neutral-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Validity</span>
                <span className="text-xs font-bold uppercase">
                  {voucher.valid_from ? formatDate(voucher.valid_from) : '...'} — {voucher.valid_to ? formatDate(voucher.valid_to) : '...'}
                </span>
              </div>
            </div>
          )}

          {voucher.min_orders !== undefined && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-neutral-950 flex items-center justify-center bg-white">
                <FaMoneyBillWave className="text-neutral-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Min. Order</span>
                <span className="text-sm font-black uppercase tracking-tight text-red-600">
                  {voucher.min_orders === 0 ? 'NO MINIMUM' : `₱${voucher.min_orders}`}
                </span>
              </div>
            </div>
          )}

          {/* Redeemed Info */}
          {redeemed && voucher.redeemedAt && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t-2 border-neutral-200">
              <div className="w-8 h-8 border-2 border-neutral-950 flex items-center justify-center bg-neutral-950 text-white">
                <FaCheckCircle />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Used On</span>
                <span className="text-xs font-bold uppercase text-neutral-950">
                  {formatDate(voucher.redeemedAt)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── STATUS BUTTON ── */}
      <div className="border-t-[6px] border-neutral-950 bg-white">
        <div className={`w-full py-4 font-black text-xs uppercase tracking-[0.2em] text-center
            ${
              isExpired
                ? 'bg-neutral-200 text-neutral-400'
                : redeemed
                ? 'bg-neutral-950 text-white'
                : 'bg-red-600 text-white'
            }`}
        >
          {statusText}
        </div>
      </div>
    </div>
  );
};

export default ClaimedVoucherCard;
