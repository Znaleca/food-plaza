'use client';

import React, { useEffect, useState } from 'react';
import { FaPercent, FaStore } from 'react-icons/fa6';
import getDetailedPromos from '@/app/actions/getDetailedPromos'; 

const UsedVoucherWallet = ({ activeVouchersPerRoom, roomNames }) => {
  const [voucherDetails, setVoucherDetails] = useState({});

  useEffect(() => {
    const loadVoucherDetails = async () => {
      const allPromos = await getDetailedPromos();

      const detailsMap = {};
      Object.entries(activeVouchersPerRoom).forEach(([roomId, voucher]) => {
        if (!voucher) return;

        const fullPromo = allPromos.find((promo) => promo.id === voucher.id);
        if (fullPromo) {
          detailsMap[roomId] = fullPromo;
        }
      });

      setVoucherDetails(detailsMap);
    };

    loadVoucherDetails();
  }, [activeVouchersPerRoom]);

  const entries = Object.entries(voucherDetails);

  if (entries.length === 0) return null;

  return (
    <div className="mt-10 p-4 bg-neutral-800 border-2 border-pink-600 rounded-lg max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold text-pink-500 mb-4 text-center">Applied Vouchers</h3>
      <div className="space-y-4">
        {entries.map(([roomId, promo]) => (
          <div key={roomId} className="flex items-start gap-4 bg-neutral-900 p-3 rounded shadow">
            <div className="flex items-center justify-center w-10 h-10 bg-pink-600 rounded-full">
              <FaPercent className="text-white" />
            </div>
            <div className="flex-1 text-white">
              <p className="text-sm font-medium text-pink-400">{promo.title}</p>
              <p className="text-sm">
                <FaStore className="inline mr-1 text-blue-400" />
                <span className="text-white font-semibold">
                  {roomNames[roomId] || 'Unknown Stall'}
                </span>
                {' — '}
                <span className="text-green-400">{promo.discount}% OFF</span>
              </p>
              {promo.description && (
                <p className="text-xs text-gray-400 mt-1 italic">{promo.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsedVoucherWallet;
