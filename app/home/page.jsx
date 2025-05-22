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
    <div className="w-full min-h-screen -mt-20 bg-neutral-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center w-full min-h-[80vh] text-center px-4 sm:px-6 pt-24 sm:pt-32 bg-neutral-900">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-tight text-white">
          <span className="font-poppins text-5xl sm:text-7xl md:text-9xl tracking-widest">THE CORNER</span>
          <br />
          <span className="mt-4 block text-xl sm:text-3xl md:text-2xl font-light text-pink-600 tracking-widest">
            FOOD PLAZA
          </span>
        </h1>

        {/* Search Bar */}
        <div className="mt-6 w-full max-w-xs sm:max-w-md">
          <SearchBar />
        </div>

        {/* Call To Action Button */}
        <button
          onClick={handleReserveClick}
          className="mt-6 px-8 py-3 text-lg sm:text-xl font-bold tracking-widest text-white bg-black rounded-full hover:bg-pink-600 transition-transform transform hover:scale-105 flex items-center gap-2"
        >
          Browse <FaArrowRight className="text-white text-xl" />
        </button>
      </section>

      {/* Features Section */}
      <section className="w-full py-7 bg-neutral-900">
        <FeaturesSection />
      </section>

      {/* Food Stall Gallery Section */}
      <section className="w-full py-7 bg-stone-800">
        <ImagePreview />
      </section>

      {/* Featured Menu Section */}
      <section className="py-7 w-full bg-neutral-900">
        <FeaturedPage />
      </section>

      {/* About Section */}
      <section className="py-10 w-full bg-neutral-900">
        <AboutSection />
      </section>
    </div>
  );
};

export default HomePage;
