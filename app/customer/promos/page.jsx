'use client';

import React, { useEffect, useState } from 'react';
import getAllPromos from '@/app/actions/getAllPromos';
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';
import VouchersCard from '@/components/VouchersCard';
import checkAuth from '@/app/actions/checkAuth';
import getRoomByUserId from '@/app/actions/getRoomByUserId';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link'; // <-- Import Link for the login button

const CustomerPromoPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // <-- New state for auth status

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResult = await checkAuth();
        const user = authResult.user;

        if (!user) {
          // User is not authenticated
          setIsAuthenticated(false);
          return;
        }

        // User is authenticated, proceed with data fetching
        setIsAuthenticated(true);
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

  const renderContent = () => {
    if (loading) {
      // Show loading spinner while the auth check and data fetching is in progress
      return <LoadingSpinner message="Loading promotions..." />;
    }

    if (!isAuthenticated) {
      // Show login prompt if not authenticated
      return (
        <div className="text-center p-10 col-span-full">
          <p className="text-sm text-white font-extralight mb-6">
            Please log in to view and claim exclusive vouchers.
          </p>
          <Link href="/login" passHref>
            <button className="bg-pink-600 hover:bg-pink-700 transition duration-300 text-white font-bold py-3 px-6 rounded-lg text-base shadow-lg">
              Go to Login
            </button>
          </Link>
        </div>
      );
    }

    // Show vouchers if authenticated and loaded
    return (
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
          <p className="col-span-full text-center text-gray-500">No vouchers available at the moment.</p>
        )}
      </div>
    );
  };

  return (
    <div className="-mt-20 py-12 bg-neutral-950 text-white">
      <div className="text-center mb-40 mt-5 px-4">
      <header className="text-center mb-28 mt-12 sm:mt-16 px-4">
        <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
        PROMOTIONS        </h2>
        <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
        Unlock exclusive{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          deals and discounts.          </span>
        </p>
      </header>
      </div>

      {renderContent()}
    </div>
  );
};

export default CustomerPromoPage;