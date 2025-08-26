'use client';

import React, { useEffect, useState } from 'react';
import getAllPromos from '@/app/actions/getAllPromos';
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';
import VouchersCard from '@/components/VouchersCard';
import checkAuth from '@/app/actions/checkAuth';
import getRoomByUserId from '@/app/actions/getRoomByUserId';

const CustomerPromoPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { user } = await checkAuth();

        const [allPromos, claimedVouchers] = await Promise.all([
          getAllPromos(),
          getAllClaimedVouchers(),
        ]);

        const claimedIds = claimedVouchers.map(v => v.$id);
        const redeemedIds = allPromos
          .filter(promo => Array.isArray(promo.redeemed) && promo.redeemed.includes(user.id))
          .map(promo => promo.$id);

        // Remove promos that are claimed OR redeemed
        const hiddenIds = new Set([...claimedIds, ...redeemedIds]);
        const unclaimedUnredeemedPromos = allPromos.filter(promo => !hiddenIds.has(promo.$id));

        // Fetch stall names for promos
        const promosWithStall = await Promise.all(
          unclaimedUnredeemedPromos.map(async (promo) => {
            if (promo.user_id) {
              const stall = await getRoomByUserId(promo.user_id);
              return { ...promo, stallName: stall?.name || 'Unknown Stall' };
            }
            return { ...promo, stallName: 'Unknown Stall' };
          })
        );

        setPromos(promosWithStall);
      } catch (error) {
        console.error('Error fetching promos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClaimUpdate = (voucherId) => {
    setPromos(prev => prev.filter(p => p.$id !== voucherId));
  };

  return (
    <div className="container mx-auto py-12 bg-neutral-900 text-white">
      <div className="text-center mb-40 mt-5 px-4">
        <h2 className="text-lg sm:text-1xl text-pink-600 font-light tracking-widest">PROMOTIONS</h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white tracking-widest">
          Unlock exclusive deals and discounts.
        </p>
      </div>

      {/* Improved Loading UI with a single, simple spinner */}
      {loading ? (
        <div className="col-span-full flex flex-col justify-center items-center py-20">
          <div className="relative">
            <div className="animate-spin h-16 w-16 rounded-full border-4 border-b-transparent border-t-pink-600 border-l-purple-500 border-r-transparent"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {promos.length > 0 ? (
            promos.map((voucher) => (
              <VouchersCard
                key={voucher.$id}
                voucher={voucher}
                stallName={voucher.stallName}
                onClaim={() => handleClaimUpdate(voucher.$id)}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No vouchers available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerPromoPage;
