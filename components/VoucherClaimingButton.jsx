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
  
  // New state variable to track if the voucher is sold out
  const [isSoldOut, setIsSoldOut] = useState(false);

  useEffect(() => {
    // Determine if the voucher is sold out based on the props
    if (claimedUsersCount >= quantity) {
      setIsSoldOut(true);
    }
    
    const fetchUserAndCheckClaim = async () => {
      try {
        const { user } = await checkAuth();
        if (!user) return;

        setUserId(user.id);

        // Fetch claimed vouchers and check if the current user has claimed this one
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
    
    // Do not allow claiming if it's already sold out on the client side
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

  // Determine the button text and disabled state
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
      className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50"
      disabled={isDisabled}
    >
      {buttonText}
    </button>
  );
};

export default VoucherClaimingButton;