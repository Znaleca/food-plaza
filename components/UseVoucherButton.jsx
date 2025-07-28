'use client';

import React, { useState } from 'react';
import useVoucher from '@/app/actions/useVoucher';

const UseVoucherButton = ({ voucherId, onUsed }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUse = async () => {
    setLoading(true);
    const result = await useVoucher(voucherId, true);
    setLoading(false);

    if (result.success) {
      onUsed?.();
    } else {
      setError(result.error || 'Failed to apply voucher');
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleUse}
        disabled={loading}
        className="px-3 py-1 text-xs bg-pink-600 text-white rounded hover:bg-pink-700 transition disabled:opacity-50"
      >
        {loading ? 'Applying...' : 'Apply'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default UseVoucherButton;
