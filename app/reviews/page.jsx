'use client';

import React from 'react';
import RateCard from '@/components/RateCard';

const ReviewsPage = () => {
  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white py-20 px-6 sm:px-12 overflow-x-hidden">
      <div className="text-center mb-8 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">Reviews</h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">All Food Stall Reviews</p>
      </div>

      {/* Reviews / RateCard */}
      <div className="space-y-10 max-w-5xl mx-auto">
        <RateCard />
        {/* Add more components here if needed */}
      </div>
    </div>
  );
};

export default ReviewsPage;
