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
        if (onClaim) onClaim(); // Added this to trigger UI update
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
  let buttonText = 'CLAIM VOUCHER →';
  let isDisabled = isClaiming || isClaimed || isSoldOut;

  if (isClaiming) {
    buttonText = 'CLAIMING...';
  } else if (isSoldOut) {
    buttonText = 'SOLD OUT';
  } else if (isClaimed) {
    buttonText = 'ALREADY CLAIMED';
  }

  return (
    <button
      onClick={handleClaimClick}
      disabled={isDisabled}
      className={`w-full py-4 border-4 font-black text-xs uppercase tracking-[0.2em] transition-all duration-200 
        ${
          isDisabled
            ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
            : 'bg-neutral-950 text-white border-neutral-950 hover:bg-red-600 hover:border-red-600 active:scale-95'
        }`}
    >
      {buttonText}
    </button>
  );
};

export default VoucherClaimingButton;
