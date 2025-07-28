'use client';

import React, { useState } from 'react';
import useVoucher from '@/app/actions/useVoucher';

const CancelVoucherButton = ({ voucherId, onCancelled }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    setLoading(true);
    const result = await useVoucher(voucherId, false);
    setLoading(false);

    if (result.success) {
      onCancelled?.();
    } else {
      setError(result.error || 'Failed to cancel voucher');
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
      >
        {loading ? 'Canceling...' : 'Cancel'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default CancelVoucherButton;
