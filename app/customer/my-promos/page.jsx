'use client';

import React, { useEffect, useState } from 'react';
import ClaimedVoucherCard from '@/components/ClaimedVoucherCard';
import getMyClaimedVouchers from '@/app/actions/getMyClaimedVouchers';
import checkAuth from '@/app/actions/checkAuth';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

const MyPromosPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResult = await checkAuth();
        const user = authResult?.user;

        if (!user) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);

        const { vouchers, userId } = await getMyClaimedVouchers();
        setVouchers(vouchers);
        setUserId(userId);
      } catch (err) {
        console.error('Error fetching claimed vouchers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-32 bg-white min-h-screen">
        <LoadingSpinner message="SYNCING YOUR PROMOTIONS..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-white text-neutral-950 flex flex-col items-center justify-center p-6">
        <div className="border-4 border-dashed border-neutral-300 bg-neutral-50 py-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-neutral-950 text-white flex items-center justify-center mb-6 font-black text-2xl">
            !
          </div>
          <p className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-4">AUTHENTICATION REQUIRED</p>
          <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-8 max-w-md">
            Please log in to view and manage your claimed vouchers.
          </p>
          <Link href="/login" passHref>
            <button className="py-4 px-8 border-4 border-neutral-950 bg-neutral-950 text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-red-600 hover:border-red-600 transition-colors duration-200">
              GO TO LOGIN →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const redeemedVouchers = vouchers.filter(
    (v) => Array.isArray(v.redeemed) && v.redeemed.includes(userId)
  );
  const unredeemedVouchers = vouchers.filter(
    (v) => !Array.isArray(v.redeemed) || !v.redeemed.includes(userId)
  );

  return (
    <div className="w-full min-h-screen bg-white text-neutral-950 font-sans selection:bg-red-600 selection:text-white pb-20">
      
      {/* ── HEADER ── */}
      <section className="w-full border-b-[8px] border-neutral-950 pt-32 pb-16 px-6 md:px-20 relative overflow-hidden bg-neutral-50 mb-12">
        <div className="absolute top-0 left-0 w-full h-4 bg-neutral-950"></div>
        <div className="absolute top-0 left-12 w-4 h-full bg-neutral-950 opacity-10 hidden md:block"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-xs font-black tracking-[0.4em] uppercase text-neutral-500 block mb-4">
            MY PROMOTIONS
          </span>
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8 max-w-4xl">
            YOUR<br/>EXCLUSIVE REWARDS
          </h2>

          <Link
            href="/customer/promos"
            className="inline-flex items-center gap-3 py-4 px-8 border-4 border-neutral-950 bg-white font-black text-sm uppercase tracking-[0.2em] hover:bg-neutral-950 hover:text-white transition-colors duration-200"
          >
            ← BROWSE ALL PROMOTIONS
          </Link>
        </div>
      </section>

      {/* ── BODY ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-20 space-y-20">
        
        {/* Unredeemed Section */}
        <div>
          <div className="flex items-center gap-4 mb-8 pb-4 border-b-[6px] border-neutral-950">
            <div className="w-4 h-4 bg-red-600"></div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">READY TO USE</h2>
          </div>
          
          {unredeemedVouchers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {unredeemedVouchers.map((voucher) => (
                <ClaimedVoucherCard key={voucher.$id} voucher={voucher} redeemed={false} />
              ))}
            </div>
          ) : (
            <div className="border-4 border-dashed border-neutral-300 bg-neutral-50 py-16 px-6 text-center">
              <span className="font-black text-neutral-400 text-2xl block mb-2">Ø</span>
              <p className="text-xl font-black uppercase tracking-tighter text-neutral-500">NO AVAILABLE VOUCHERS</p>
            </div>
          )}
        </div>

        {/* Redeemed Section */}
        <div>
          <div className="flex items-center gap-4 mb-8 pb-4 border-b-[6px] border-neutral-950">
            <div className="w-4 h-4 bg-neutral-400"></div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-neutral-500">HISTORY / USED</h2>
          </div>
          
          {redeemedVouchers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {redeemedVouchers.map((voucher) => (
                <ClaimedVoucherCard key={voucher.$id} voucher={voucher} redeemed />
              ))}
            </div>
          ) : (
            <div className="border-4 border-dashed border-neutral-300 bg-neutral-50 py-16 px-6 text-center">
              <span className="font-black text-neutral-400 text-2xl block mb-2">Ø</span>
              <p className="text-xl font-black uppercase tracking-tighter text-neutral-500">NO REDEEMED VOUCHERS YET</p>
            </div>
          )}
        </div>

      </section>
    </div>
  );
};

export default MyPromosPage;
