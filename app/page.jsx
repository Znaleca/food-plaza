'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FeaturedPage from '@/components/FeaturedPage';
import SearchBar from '@/components/SearchBar';
import FeaturesSection from '@/components/FeaturesSection';
import AboutSection from '@/components/AboutSection';
import RateCard from '@/components/RateCard';
import { FaArrowRight } from 'react-icons/fa6';
import BrowsePreview from '@/components/BrowsePreview';

const HomePage = () => {
  const router = useRouter();

  const handleReserveClick = () => {
    router.push('/search');
  };

  // ✅ Scroll to section if URL has hash (#browse or #reviews)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const section = document.querySelector(hash);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-32 pb-20 bg-neutral-900">
        <h1 className="text-4xl mt-20 sm:text-6xl md:text-8xl font-extrabold leading-tight tracking-tight">
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
      <section className="py-14 -mb-80 bg-neutral-900">
        <div className="container mx-auto px-4">
          <FeaturesSection />
        </div>
      </section>

      {/* 📌 Food Stall / Menu Section */}
      <section id="browse" className="py-14 bg-neutral-900 scroll-mt-28">
        <div className="container mx-auto px-4">
          <BrowsePreview />
        </div>
      </section>
      
      {/* Featured Menu Section */}
      <section className="py-14 bg-neutral-900">
        <div className="container mx-auto px-4">
          <FeaturedPage />
        </div>
      </section>

       {/* ⭐ Reviews Section */}
       <section id="reviews" className="py-20 bg-neutral-900 w-full min-h-screen flex flex-col items-center justify-center text-center">
        <div className="text-center mb-16 px-4">
          <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">
            REVIEWS
          </h2>
          <p className="mt-4 text-3xl sm:text-5xl font-extrabold text-white">
            Your opinion is important
          </p>
        </div>
        <RateCard />
      </section>
    
<section id="about-us" className="py-20 bg-neutral-900 scroll-mt-5">
    <div className="w-full">
        <AboutSection />
    </div>
</section>
    </div>
  );
};

export default HomePage;
