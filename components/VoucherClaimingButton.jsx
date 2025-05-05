'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import claimVoucher from '@/app/actions/claimVoucher';
import checkAuth from '@/app/actions/checkAuth'; 
import getAllClaimedVouchers from '@/app/actions/getAllClaimedVoucher';


const VoucherClaimingButton = ({ voucherId }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
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
  }, [voucherId]);

  const handleClaimClick = async () => {
    if (!voucherId || !userId) {
      toast.error('Invalid voucher or user.');
      return;
    }

    setIsClaiming(true);

    try {
      const result = await claimVoucher(voucherId);

      if (result.success) {
        setIsClaimed(true); // Update the button state for this user
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

  return (
    <button
      onClick={handleClaimClick}
      className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50"
      disabled={isClaiming || isClaimed} // Disable if already claimed
    >
      {isClaiming ? 'Claiming...' : isClaimed ? 'Already Claimed' : 'Claim Voucher'}
    </button>
  );
};

export default VoucherClaimingButton;
