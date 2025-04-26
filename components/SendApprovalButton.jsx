'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';

const SendApprovalButton = ({ booking, user }) => {
  const [loading, setLoading] = useState(false);

  const handleSendApproval = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/xendit/checkout-lease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking, user }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Something went wrong');
      }

      window.location.href = data.redirect_url;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSendApproval}
      disabled={loading}
      className="w-full py-3 px-4 bg-green-600 text-white font-medium text-sm rounded-md shadow-sm hover:bg-green-700 transition duration-300"
    >
      {loading ? 'Processing...' : 'Send Approval'}
    </button>
  );
};

export default SendApprovalButton;
