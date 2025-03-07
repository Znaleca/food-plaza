'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  const handleReserveClick = () => {
    router.push('/'); // Navigate to rooms page
  };

  return (
    <div className=" w-full min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center h-screen text-center px-6">
        <h1 className="text-7xl md:text-8xl font-black tracking-tight leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-blue-400">
            THE CORNER
          </span>
        </h1>

        <p className="mt-8 max-w-3xl text-lg md:text-2xl font-bold leading-relaxed text-gray-600">
         Food Plaza
        </p>

        <button
          className="mt-12 px-10 py-4 text-xl md:text-2xl font-medium text-white rounded-full shadow-lg 
          bg-gradient-to-r from-yellow-500 to-blue-500 hover:from-blue-500 hover:to-yellow-500 
          transition-transform transform hover:scale-105"
          onClick={handleReserveClick}
        >
          View Stalls
        </button>
      </div>
    </div>
  );
};

export default HomePage;
