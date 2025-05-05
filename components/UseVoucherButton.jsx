'use client';

import React, { useState, useEffect } from 'react';
import useVoucher from '@/app/actions/useVoucher';

const UseVoucherButton = ({ voucherId, claimedUsers, usedVoucherArray, userId, onUsed }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUsed, setIsUsed] = useState(false);

  useEffect(() => {
    // Check if the current user has claimed and used the voucher
    if (Array.isArray(claimedUsers) && Array.isArray(usedVoucherArray)) {
      const userIndex = claimedUsers.indexOf(userId);
      if (userIndex !== -1) {
        setIsUsed(usedVoucherArray[userIndex] === true);
      }
    }
  }, [claimedUsers, usedVoucherArray, userId]);

  const handleToggleUse = async () => {
    setLoading(true);
    setError('');

    const markAsUsed = !isUsed; // Toggle between used and unused
    const result = await useVoucher(voucherId, markAsUsed);
    setLoading(false);

    if (result.success) {
      setIsUsed(markAsUsed); // Update the local state for the button
      onUsed?.(markAsUsed ? { id: voucherId, discount: result.document.discount, title: result.document.title } : null); // Notify parent to update state
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleToggleUse}
        disabled={loading}
        className="px-3 py-1 text-xs bg-pink-600 text-white rounded hover:bg-pink-700 transition disabled:opacity-50"
      >
        {loading
          ? isUsed
            ? 'Removing...'
            : 'Using...'
          : isUsed
          ? 'Cancel' 
          : 'Use'} 
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default UseVoucherButton;
