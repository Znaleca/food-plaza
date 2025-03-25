'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import FeaturedPage from '@/components/FeaturedPage';
import ImagePreview from '@/components/ImagePreview';
import SearchBar from '@/components/SearchBar';

const HomePage = () => {
  const router = useRouter();

  const handleReserveClick = () => {
    router.push('/'); // Navigate to rooms page
  };

  return (
    <div 
  className="w-full min-h-screen bg-cover bg-center text-gray-900"
  style={{ backgroundImage: "url('/images/backdrop.jpg')" }}
>

      {/* Overlay for better text contrast */}
      <div className="w-full min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-tight text-white">
          <span className="relative inline-block px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg">
            THE CORNER
          </span>
          <br />
          <span className="mt-4 block text-4xl md:text-5xl font-bold text-black">
            FOOD PLAZA
          </span>
        </h1>

        {/* Search Bar */}
        <div className="mt-8 w-full">
          <SearchBar />
        </div>

        <button
          className="mt-12 px-10 py-4 text-xl md:text-2xl font-medium text-white rounded-full shadow-lg 
          bg-black hover:bg-gray-900 transition-transform transform hover:scale-105"
          onClick={handleReserveClick}
        >
          View Stalls
        </button>
      </div>

      {/* Full-Width Image Preview */}
      <div className="w-full">
        <ImagePreview />
      </div>

      {/* Featured Menu Preview */}
      <div className="mt-12">
        <FeaturedPage />
      </div>
    </div>
  );
};

export default HomePage;
