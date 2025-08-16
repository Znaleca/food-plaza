'use client';

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaPercent, FaStore, FaCheck } from 'react-icons/fa';
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';
import checkAuth from '@/app/actions/checkAuth';
import UseVoucherButton from './UseVoucherButton';
import CancelVoucherButton from './CancelVoucherButton';
import getRoomByUserId from '@/app/actions/getRoomByUserId';

const VoucherWallet = ({ onVoucherUsed, roomIdFilter, usedVoucherStates, setUsedVoucherStates }) => {
  const [vouchers, setVouchers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stallData, setStallData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const { user } = await checkAuth();
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
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) return <p className="text-center text-gray-400">Loading vouchers...</p>;

  const filteredVouchers = roomIdFilter
    ? vouchers.filter((v) => stallData[v.$id]?.id === roomIdFilter)
    : vouchers;

  if (filteredVouchers.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-neutral-900 shadow-sm rounded-lg">
        <h2 className="text-2xl font-medium text-pink-600 text-center mb-6">Voucher Wallet</h2>
        <p className="text-center text-gray-400">No vouchers claimed yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-neutral-900 shadow-sm rounded-lg">
      <h2 className="text-2xl font-medium text-pink-600 text-center mb-6">Voucher Wallet</h2>

      <div className="space-y-6">
        {filteredVouchers.map((voucher) => {
          const isActive = new Date(voucher.valid_to).setHours(23, 59, 59, 999) >= new Date();
          const isUsed = usedVoucherStates[voucher.$id];
          const stallName = stallData[voucher.$id]?.name || 'Unknown Stall';

          return (
            <div
              key={voucher.$id}
              className={`relative w-full max-w-md mx-auto p-4 bg-neutral-900 text-white rounded-lg transition-all duration-300 
              ${!isActive ? 'opacity-60' : 'shadow-md hover:shadow-lg'} border-2 border-pink-600 
              ${!isActive ? 'border-opacity-50' : ''}`}
            >
              {isUsed && (
                <div className="absolute top-2 right-2 bg-green-700 text-white text-xs font-medium px-2 py-1 rounded shadow z-10 flex items-center gap-1">
                  <FaCheck className="text-white text-xs" />
                  Applied
                </div>
              )}

              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-4xl font-semibold opacity-40 pointer-events-none">
                  EXPIRED
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 flex items-center justify-center bg-neutral-700 rounded-full">
                  <FaPercent className="text-white text-2xl" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{voucher.title || 'Voucher Title'}</h3>
                  <p className="text-sm text-pink-400">{voucher.discount}% OFF</p>
                  <div className="mt-1 flex flex-col text-sm text-gray-400">
                    <span><strong>From:</strong> {formatDate(voucher.valid_from)}</span>
                    <span><strong>To:</strong> {formatDate(voucher.valid_to)}</span>
                    <span className="flex items-center gap-2 mt-1 text-blue-400">
                      <FaStore /> <strong>Food Stall:</strong> {stallName}
                    </span>
                  </div>
                </div>
              </div>

              {voucher.description && (
                <p className="mt-2 text-gray-400 text-xs italic">{voucher.description}</p>
              )}

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

              {isActive && (
                <div className="mt-4 flex space-x-3">
                  {!isUsed ? (
                    <UseVoucherButton
                      voucherId={voucher.$id}
                      onUsed={() => {
                        setUsedVoucherStates((prev) => ({ ...prev, [voucher.$id]: true }));
                        onVoucherUsed?.({
                          $id: voucher.$id,
                          discount: voucher.discount,
                          title: voucher.title,
                        });
                      }}
                    />
                  ) : (
                    <CancelVoucherButton
                      voucherId={voucher.$id}
                      onCancelled={() => {
                        setUsedVoucherStates((prev) => ({ ...prev, [voucher.$id]: false }));
                        onVoucherUsed?.(null);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VoucherWallet;
