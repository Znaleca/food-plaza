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
        <div className="container mx-auto px-4"> {/* Container added here */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-tight text-white">
  <span className="relative inline-block px-6 py-2 bg-black rounded-xl shadow-lg">
    <span className="font-poppins text-7xl md:text-9xl leading-tight text-gradient">
      THE CORNER
    </span>
  </span>
  <br />
  <span className="mt-4 block text-4xl md:text-5xl font-bold text-pink-600">
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
            Order Now!
          </button>
        </div>
      </div>

      {/* Full-Width Image Preview */}
      <div className="w-full">
        <div className="container mx-auto px-4"> {/* Container added here */}
          <ImagePreview />
        </div>
      </div>

      {/* Featured Menu Preview */}
      <div className="container mx-auto px-4 mt-12"> {/* Container added here */}
        <FeaturedPage />
      </div>
    </div>
  );
};

export default HomePage;
