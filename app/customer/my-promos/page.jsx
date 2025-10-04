'use client';

import React, { useEffect, useState } from 'react';
import ClaimedVoucherCard from '@/components/ClaimedVoucherCard';
import getMyClaimedVouchers from '@/app/actions/getMyClaimedVouchers';
import checkAuth from '@/app/actions/checkAuth';
import { FaTicketAlt, FaGift } from 'react-icons/fa';
import Link from 'next/link';

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
      <div className="flex items-center justify-center min-h-[50vh] text-gray-400 animate-pulse">
        Loading your promos...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <FaTicketAlt className="text-6xl text-cyan-400" />
        <p className="text-lg text-white font-light">
          Please log in to view and manage your claimed vouchers.
        </p>
        <Link href="/login" passHref>
          <button className="bg-pink-600 hover:bg-pink-700 transition duration-300 text-white font-bold py-3 px-8 rounded-lg shadow-lg">
            Go to Login
          </button>
        </Link>
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400 space-y-3">
        <FaTicketAlt className="text-5xl text-cyan-400" />
        <p className="text-lg font-medium">You haven’t claimed any vouchers yet.</p>
      </div>
    );
  }

  // Split into redeemed vs unredeemed using userId
  const redeemedVouchers = vouchers.filter(
    (v) => Array.isArray(v.redeemed) && v.redeemed.includes(userId)
  );
  const unredeemedVouchers = vouchers.filter(
    (v) => !Array.isArray(v.redeemed) || !v.redeemed.includes(userId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <header className="text-center mb-20">
        <h2 className="text-sm sm:text-base font-medium tracking-[0.4em] uppercase text-cyan-400">
          My Promotions
        </h2>
        <h1 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
          Your{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            Exclusive Rewards
          </span>
        </h1>
        <div className="mt-6 w-24 h-1 mx-auto bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full"></div>
      </header>

      {/* Unredeemed Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <FaGift className="text-cyan-400 text-2xl" />
          <h2 className="text-2xl font-semibold text-cyan-400">Claimed Vouchers</h2>
        </div>
        {unredeemedVouchers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {unredeemedVouchers.map((voucher) => (
              <ClaimedVoucherCard key={voucher.$id} voucher={voucher} redeemed={false} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500 space-y-2">
            <FaTicketAlt className="text-4xl" />
            <p className="italic">No available vouchers right now.</p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-gray-700 my-10"></div>

      {/* Redeemed Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <FaTicketAlt className="text-fuchsia-400 text-2xl" />
          <h2 className="text-2xl font-semibold text-fuchsia-400">Redeemed Vouchers</h2>
        </div>
        {redeemedVouchers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {redeemedVouchers.map((voucher) => (
              <ClaimedVoucherCard key={voucher.$id} voucher={voucher} redeemed />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500 space-y-2">
            <FaGift className="text-4xl" />
            <p className="italic">No redeemed vouchers yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyPromosPage;
