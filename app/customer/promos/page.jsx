'use client';

import React, { useEffect, useState } from 'react';
import getPromos from '@/app/actions/getPromos';
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';
import VouchersCard from '@/components/VouchersCard';

const CustomerPromoPage = () => {
  const [promos, setPromos] = useState([]);
  const [claimedIds, setClaimedIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [allPromos, claimedVouchers] = await Promise.all([
        getPromos(),
        getAllClaimedVouchers(),
      ]);

      const claimedIds = claimedVouchers.map(v => v.$id);
      setClaimedIds(claimedIds);

      const unclaimedPromos = allPromos.filter(promo => !claimedIds.includes(promo.$id));
      setPromos(unclaimedPromos);
    };

    fetchData();
  }, []);

  const handleClaimUpdate = (voucherId) => {
    // Remove claimed promo from the display
    setPromos(prev => prev.filter(p => p.$id !== voucherId));
  };

  return (
    <div className="container mx-auto py-12 bg-neutral-900 text-white">
      {/* New Header */}
      <div className="text-center mb-40 mt-5 px-4">
        <h2 className="text-lg sm:text-1xl text-pink-600 font-light tracking-widest">PROMOTIONS</h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white tracking-widest">
        Unlock exclusive deals and discounts.        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {promos && promos.length > 0 ? (
          promos.map((voucher) => (
            <VouchersCard
              key={voucher.$id}
              voucher={voucher}
              onClaim={() => handleClaimUpdate(voucher.$id)}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No vouchers available.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerPromoPage;
