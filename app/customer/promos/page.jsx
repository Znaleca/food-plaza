'use client';

import React, { useEffect, useState } from 'react';
import getAllPromos from '@/app/actions/getAllPromos';
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';
import VouchersCard from '@/components/VouchersCard';
import checkAuth from '@/app/actions/checkAuth';
import getRoomByUserId from '@/app/actions/getRoomByUserId';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

const CustomerPromoPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResult = await checkAuth();
        const user = authResult.user;

        if (!user) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
        const [allPromos, claimedVouchers] = await Promise.all([
          getAllPromos(),
          getAllClaimedVouchers(),
        ]);

        const claimedIds = claimedVouchers.map(v => v.$id);
        const redeemedIds = allPromos
          .filter(promo => Array.isArray(promo.redeemed) && promo.redeemed.includes(user.id))
          .map(promo => promo.$id);

        const hiddenIds = new Set([...claimedIds, ...redeemedIds]);
        const unclaimedUnredeemedPromos = allPromos.filter(promo => !hiddenIds.has(promo.$id));

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
      return (
        <div className="flex justify-center py-20">
          <LoadingSpinner message="SYNCING VOUCHERS..." />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="border-4 border-dashed border-neutral-300 bg-neutral-50 py-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-neutral-950 text-white flex items-center justify-center mb-6 font-black text-2xl">
            !
          </div>
          <p className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-4">AUTHENTICATION REQUIRED</p>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-8 max-w-md">
            Please log in to view and claim exclusive vouchers for your account.
          </p>
          <Link href="/login" passHref>
            <button className="py-4 px-8 border-4 border-neutral-950 bg-neutral-950 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-red-600 hover:border-red-600 transition-colors duration-200">
              GO TO LOGIN →
            </button>
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        {promos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {promos.map((voucher) => (
              <VouchersCard
                key={voucher.$id}
                voucher={voucher}
                stallName={voucher.stallName}
                onClaim={() => handleClaimUpdate(voucher.$id)}
              />
            ))}
          </div>
        ) : (
          <div className="border-4 border-dashed border-neutral-300 bg-neutral-50 py-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-neutral-200 flex items-center justify-center mb-6">
              <span className="font-black text-neutral-400 text-2xl">Ø</span>
            </div>
            <p className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-2">NO VOUCHERS AVAILABLE</p>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
              Check back later for new promotions.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-white text-neutral-950 font-sans selection:bg-red-600 selection:text-white pb-20">
      
      {/* ── HEADER ── */}
      <section className="w-full border-b-[8px] border-neutral-950 pt-32 pb-16 px-6 md:px-20 relative overflow-hidden bg-neutral-50 mb-12">
        <div className="absolute top-0 left-0 w-full h-4 bg-red-600"></div>
        <div className="absolute top-0 left-12 w-4 h-full bg-red-600 opacity-20 hidden md:block"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-xs font-black tracking-[0.4em] uppercase text-red-600 block mb-4">
            PROMOTIONS
          </span>
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8 max-w-4xl">
            UNLOCK<br/>EXCLUSIVE DEALS
          </h2>

          <Link
            href="/customer/my-promos"
            className="inline-flex items-center gap-3 py-4 px-8 border-4 border-neutral-950 bg-white font-black text-sm uppercase tracking-[0.2em] hover:bg-neutral-950 hover:text-white transition-colors duration-200"
          >
            VIEW MY CLAIMED VOUCHERS →
          </Link>
        </div>
      </section>

      {/* ── BODY ── */}
      <section className="px-6 md:px-20">
        {renderContent()}
      </section>
    </div>
  );
};

export default CustomerPromoPage;