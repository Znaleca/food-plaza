'use client';

import React, { useState } from 'react';
import useVoucher from '@/app/actions/useVoucher';

const UseVoucherButton = ({ voucherId, isUsed, onUsed }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleUse = async () => {
    setLoading(true);
    setError('');

    const markAsUsed = !isUsed; // If the voucher is used, mark it as unused (cancel) and vice versa.
    const result = await useVoucher(voucherId, markAsUsed);
    setLoading(false);

    if (result.success) {
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
        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
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
