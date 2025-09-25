'use client';

import React, { useState, useEffect } from 'react';
import { FaPercent, FaStore, FaCalendarAlt, FaMoneyBillWave, FaCheck } from 'react-icons/fa';
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';
import checkAuth from '@/app/actions/checkAuth';
import UseVoucherButton from './UseVoucherButton';
import CancelVoucherButton from './CancelVoucherButton';
import getRoomByUserId from '@/app/actions/getRoomByUserId';

const VoucherWallet = ({ onVoucherUsed, roomIdFilter, usedVoucherStates, setUsedVoucherStates, roomSubtotal }) => {
  const [vouchers, setVouchers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stallData, setStallData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const { user } = await checkAuth();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      const claimedVouchers = await getAllClaimedVouchers(user);
      const data = {};
      const usedStates = { ...usedVoucherStates };

      for (const voucher of claimedVouchers) {
        if (voucher.user_id) {
          const stall = await getRoomByUserId(voucher.user_id);
          data[voucher.$id] = {
            id: stall?.$id || '',
            name: stall?.name || 'Unknown Stall',
          };
        }
        if (!(voucher.$id in usedStates)) {
          usedStates[voucher.$id] = voucher.used_voucher === true;
        }
      }

      setStallData(data);
      setUsedVoucherStates(usedStates);
      setVouchers(claimedVouchers);
      setLoading(false);
    };

    fetchData();
  }, [setUsedVoucherStates, usedVoucherStates]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-neutral-950 text-white">
        <p className="text-center text-gray-400">Loading vouchers...</p>
      </div>
    );
  }

  const filteredVouchers = roomIdFilter
    ? vouchers.filter((v) => stallData[v.$id]?.id === roomIdFilter)
    : vouchers;

  if (filteredVouchers.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-neutral-900 shadow-sm rounded-lg">
        <h2 className="text-2xl font-medium text-white text-center mb-6">Voucher Wallet</h2>
        <p className="text-center text-gray-400">No vouchers claimed yet or all have been used.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          Voucher Wallet
        </h2>
      </div>

      <div className="space-y-6">
        {filteredVouchers.map((voucher) => {
          const isActive = new Date(voucher.valid_to).setHours(23, 59, 59, 999) >= new Date();
          const isUsed = usedVoucherStates[voucher.$id];
          const stallName = stallData[voucher.$id]?.name || 'Unknown Stall';

          const claimedUsersCount = voucher.claimed_users?.length || 0;
          const totalQuantity = voucher.quantity || 0;
          const remainingVouchers = totalQuantity - claimedUsersCount;
          const claimedPercentage = (claimedUsersCount / totalQuantity) * 100;
          const isSoldOut = remainingVouchers <= 0;

          return (
            <div
              key={voucher.$id}
              className={`relative w-full h-52 mx-auto bg-neutral-900 text-white rounded-2xl shadow-xl border border-neutral-800 overflow-hidden transition-all duration-300
              ${!isActive || isSoldOut ? 'opacity-60' : 'hover:scale-105 hover:shadow-2xl'}`}
            >
              {/* Overlay states */}
              {(!isActive || isSoldOut) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-2xl">
                  <p className="text-2xl font-extrabold tracking-wide uppercase">
                    {!isActive ? 'Expired' : 'Sold Out'}
                  </p>
                </div>
              )}

              {isUsed && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow z-20 flex items-center gap-1">
                  <FaCheck className="text-white text-xs" />
                  Applied
                </div>
              )}

              <div className="relative z-10 flex h-full">
                {/* Left Section (Voucher Info) */}
                <div className="flex flex-col items-center justify-center flex-1 p-4 border-r border-neutral-700 bg-neutral-900">
                  <div className="flex items-center justify-center w-16 h-16 mb-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full shadow-lg">
                    <FaPercent className="text-white text-3xl" />
                  </div>
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-center leading-tight">
                    {voucher.discount || 'N/A'}% OFF
                  </h3>
                  <p className="text-lg font-semibold mt-1 text-center text-white">{voucher.title || 'Voucher Title'}</p>
                  {voucher.description && (
                    <p className="mt-2 text-gray-400 text-xs italic text-center max-w-[90%]">
                      {voucher.description}
                    </p>
                  )}
                </div>

                {/* Right Section (Details & Buttons) */}
                <div className="flex flex-col justify-between flex-1 p-4 space-y-2 bg-neutral-900">
                  <div className="flex flex-col space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaStore className="text-cyan-400" />
                      <span>
                        <strong className="text-white font-medium">Stall:</strong> {stallName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaCalendarAlt className="text-fuchsia-400" />
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

                  {/* Progress bar */}
                  {isActive && !isSoldOut && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-yellow-400">{remainingVouchers} left</span>
                        <span className="text-gray-400">{claimedUsersCount} / {totalQuantity} claimed</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${claimedPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div>
                    {isActive && !isSoldOut ? (
                      !isUsed ? (
                        <UseVoucherButton
                          minOrders={voucher.min_orders || 0}
                          roomSubtotal={roomSubtotal}
                          onUsed={() => {
                            setUsedVoucherStates((prev) => {
                              const newState = Object.fromEntries(
                                Object.entries(prev).map(([id, used]) => [
                                  id,
                                  stallData[id]?.id === roomIdFilter ? false : used
                                ])
                              );
                              newState[voucher.$id] = true;
                              return newState;
                            });
                            onVoucherUsed?.({
                              $id: voucher.$id,
                              discount: voucher.discount,
                              title: voucher.title,
                              min_orders: voucher.min_orders || 0,
                            });
                          }}
                        />
                      ) : (
                        <CancelVoucherButton
                          onCancelled={() => {
                            setUsedVoucherStates((prev) => ({ ...prev, [voucher.$id]: false }));
                            onVoucherUsed?.(null);
                          }}
                        />
                      )
                    ) : (
                      <button className="bg-neutral-800 text-gray-500 px-4 py-2 rounded-lg font-semibold w-full cursor-not-allowed text-sm">
                        {isSoldOut ? 'Sold Out' : 'Expired'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VoucherWallet;