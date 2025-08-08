'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import FeaturedPage from '@/components/FeaturedPage';
import ImagePreview from '@/components/ImagePreview';
import SearchBar from '@/components/SearchBar';
import FeaturesSection from '@/components/FeaturesSection';
import AboutSection from '@/components/AboutSection';
import { FaArrowRight } from 'react-icons/fa6';

const HomePage = () => {
  const router = useRouter();

  const handleReserveClick = () => {
    router.push('/');
  };

  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-32 pb-20 bg-neutral-900">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold leading-tight tracking-tight">
          <span className="font-poppins text-5xl sm:text-7xl md:text-9xl tracking-widest bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-fade-in">
            THE CORNER
          </span>
        </h1>
        <span className="mt-4 block text-xl sm:text-3xl md:text-2xl font-light text-white tracking-widest">
    FOOD PLAZA
  </span>

        {/* Search Bar */}
        <div className="mt-8 w-full max-w-xs sm:max-w-md animate-fade-in delay-300">
          <SearchBar />
        </div>

        {/* Call To Action Button */}
        <button
          onClick={handleReserveClick}
          className="mt-8 px-8 py-3 text-lg sm:text-xl font-semibold tracking-wide bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-700 hover:to-fuchsia-700 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-3 animate-fade-in delay-500"
        >
          Browse <FaArrowRight className="text-white text-xl" />
        </button>
      </section>

      {/* Features Section */}
      <section className="py-14 bg-neutral-900">
        <div className="container mx-auto px-4">
          <FeaturesSection />
        </div>
      </section>

      {/* Food Stall Gallery Section */}
      <section className="py-14 bg-stone-800">
        <div className="container mx-auto px-4">
          <ImagePreview />
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="py-14 bg-neutral-900">
        <div className="container mx-auto px-4">
          <FeaturedPage />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-neutral-900">
        <div className="container mx-auto px-4">
          <AboutSection />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
