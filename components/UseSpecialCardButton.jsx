'use client';

import { useEffect, useState } from 'react';
import { FaIdCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import getSpecialDiscount from '@/app/actions/getSpecialDiscount';

export default function UseSpecialCardButton({ onOpen }) {
  const [loading, setLoading] = useState(true);
  const [hasCard, setHasCard] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      const res = await getSpecialDiscount();
      if (res.success && res.documents.length > 0) {
        setHasCard(true);
      } else {
        setHasCard(false);
      }
      setLoading(false);
    };

    fetchCard();
  }, []);

  if (loading) {
    return (
      <div className="mt-6 text-center">
        <button
          disabled
          className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center mx-auto opacity-50"
        >
          Checking...
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 text-center">
      {hasCard ? (
        <button
          onClick={() => toast.success('Using your special discount card ✅')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center mx-auto"
        >
          <FaIdCard className="mr-2" /> Use Special Card
        </button>
      ) : (
        <button
          onClick={onOpen}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center justify-center mx-auto"
        >
          <FaIdCard className="mr-2" /> Apply for Special Discount
        </button>
      )}
    </div>
  );
}
