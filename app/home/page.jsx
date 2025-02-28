'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MapView from 'components/MapView';

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
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">
            UNI
          </span>
          <span className="text-gray-800">SPACES</span>
        </h1>

        <p className="mt-8 max-w-3xl text-lg md:text-2xl font-light leading-relaxed text-gray-600">
          Discover a seamless way to reserve spaces for your academic and 
          extracurricular activities with just a few clicks.
        </p>

        <button
          className="mt-12 px-10 py-4 text-xl md:text-2xl font-medium text-white rounded-full shadow-lg 
          bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 
          transition-transform transform hover:scale-105"
          onClick={handleReserveClick}
        >
          Reserve Spaces
        </button>
      </div>

      {/* Vision and Mission Section */}
      <div className="bg-white text-center py-12">
        <h2 className="text-3xl font-bold text-red-600">VISION</h2>
        <p className="mt-4 text-lg text-gray-600 max极-w-4xl mx-auto">
          An inclusive and sustainable University recognized for its global academic excellence by 2030.
        </p>

        <h2 className="text-3xl font-bold text-red-600 mt-10">MISSION</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto">
          To develop innovative leaders and empowered communities by delivering transformative instruction, research, extension, and production through Change Drivers and responsive policies.
        </p>
      </div>

      {/* Campus Map Section */}
      <div className=" mt-5 px-7 py-6 bg-white ">
        <h2 className="text-center text-4xl font-bold text-red-600 mb-8 tracking-wide">
          Campus Map
        </h2>

        <div className="max-w-7xl mx-auto">
          <MapView />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
