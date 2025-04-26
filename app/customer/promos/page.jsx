'use client';

import React, { useEffect, useState } from 'react';
import getPromos from '@/app/actions/getPromos';
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';
import VouchersCard from '@/components/VouchersCard';
import Heading from '@/components/Heading';

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
    <div className="container mx-auto py-12">
      <Heading title="Customer Vouchers" />
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
