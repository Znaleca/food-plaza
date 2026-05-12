'use client';

import React, { useState, useEffect } from 'react';
import {
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
      className={`relative w-full max-w-xs sm:max-w-md mx-auto bg-white text-neutral-950 border-[6px] border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col
      ${isSoldOut || isComingSoon ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(220,38,38,1)]'}`}
    >
      {/* Overlay */}
      {(isSoldOut || isComingSoon) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <p className="text-3xl font-black tracking-tighter uppercase text-red-600 border-4 border-red-600 px-4 py-2 bg-white -rotate-6">
            {isComingSoon ? 'COMING SOON' : 'SOLD OUT'}
          </p>
        </div>
      )}

      {/* ── TOP SECTION ── */}
      <div className="relative z-10 p-6 flex flex-col items-center border-b-[6px] border-neutral-950 bg-neutral-950 text-white">
        <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 font-black text-[10px] tracking-widest uppercase border-r-[6px] border-b-[6px] border-neutral-950">
          VOUCHER
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
      <div className="flex-1 p-6 bg-neutral-50 flex flex-col justify-between">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-neutral-950 flex items-center justify-center bg-white">
              <FaStore className="text-neutral-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Stall</span>
              <span className="text-sm font-black uppercase tracking-tight">{stallName}</span>
            </div>
          </div>

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
        </div>

        {/* Progress Bar */}
        {isActive && !isSoldOut && (
          <div className="border-t-4 border-neutral-950 pt-4 mt-auto">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
              <span className="text-red-600">{remainingVouchers} LEFT</span>
              <span className="text-neutral-400">
                {claimedUsersCount} / {totalQuantity} CLAIMED
              </span>
            </div>
            <div className="w-full bg-neutral-200 border-2 border-neutral-950 h-3">
              <div
                className="bg-neutral-950 h-full transition-all duration-500 ease-out border-r-2 border-neutral-950"
                style={{ width: `${claimedPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* ── CLAIM BUTTON ── */}
      <div className="border-t-[6px] border-neutral-950 bg-white">
        {isActive && !isSoldOut ? (
          <VoucherClaimingButton
            voucherId={voucher.$id}
            onClaim={handleClaim}
            claimedUsersCount={claimedUsersCount}
            quantity={totalQuantity}
          />
        ) : (
          <button className="w-full py-4 bg-neutral-200 text-neutral-500 font-black text-xs uppercase tracking-[0.2em] cursor-not-allowed">
            {isComingSoon ? 'COMING SOON' : 'UNAVAILABLE'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VouchersCard;
