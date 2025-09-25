// components/VoucherClaimingButton.js

'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import claimVoucher from '@/app/actions/claimVoucher';
import checkAuth from '@/app/actions/checkAuth'; 
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';

const VoucherClaimingButton = ({ voucherId, onClaim, claimedUsersCount, quantity }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isSoldOut, setIsSoldOut] = useState(false);

  useEffect(() => {
    if (claimedUsersCount >= quantity) {
      setIsSoldOut(true);
    }
    
    const fetchUserAndCheckClaim = async () => {
      try {
        const { user } = await checkAuth();
        if (!user) return;

        setUserId(user.id);

        const claimedVouchers = await getAllClaimedVouchers();
        const hasClaimed = claimedVouchers.some(voucher => voucher.$id === voucherId);

        setIsClaimed(hasClaimed);
      } catch (error) {
        console.error('Error checking claim status:', error);
      }
    };

    fetchUserAndCheckClaim();
  }, [voucherId, claimedUsersCount, quantity]);

  const handleClaimClick = async () => {
    if (!voucherId || !userId) {
      toast.error('Invalid voucher or user.');
      return;
    }

    if (isSoldOut) {
      toast.error('This voucher is sold out.');
      return;
    }

    setIsClaiming(true);

    try {
      const result = await claimVoucher(voucherId);

      if (result.success) {
        setIsClaimed(true);
        toast.success('Voucher claimed successfully!');
      } else {
        throw new Error(result.error || 'Failed to claim the voucher');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to claim the voucher.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Button state
  let buttonText = 'Claim Voucher';
  let isDisabled = isClaiming || isClaimed || isSoldOut;

  if (isClaiming) {
    buttonText = 'Claiming...';
  } else if (isSoldOut) {
    buttonText = 'Sold Out';
  } else if (isClaimed) {
    buttonText = 'Already Claimed';
  }

  return (
    <button
      onClick={handleClaimClick}
      disabled={isDisabled}
      className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300
        ${
          isDisabled
            ? 'bg-neutral-800 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/30'
        }`}
    >
      {buttonText}
    </button>
  );
};

export default VoucherClaimingButton;
