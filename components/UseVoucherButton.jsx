'use client';

import React, { useState } from 'react';
import useVoucher from '@/app/actions/useVoucher';

const UseVoucherButton = ({ voucherId, onUsed, minOrders, roomSubtotal }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUse = async () => {
    if (roomSubtotal < minOrders) {
      setError(`Minimum order of ₱${minOrders} not met.`);
      return;
    }

    setLoading(true);
    const result = await useVoucher(voucherId, true);
    setLoading(false);

    if (result.success) {
      onUsed?.();
    } else {
      setError(result.error || 'Failed to apply voucher');
    }
  };

  const isButtonDisabled = loading || roomSubtotal < minOrders;

  return (
    <div className="mt-2">
      <button
        onClick={handleUse}
        disabled={isButtonDisabled}
        className={`px-3 py-1 text-xs text-white rounded transition disabled:opacity-50
          ${isButtonDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'}`}
      >
        {loading ? 'Applying...' : 'Apply'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {minOrders > 0 && roomSubtotal < minOrders && (
        <p className="text-xs text-yellow-400 mt-1">
          Minimum order of ₱{minOrders} required.
        </p>
      )}
    </div>
  );
};

export default UseVoucherButton;