'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FeaturedPage from '@/components/FeaturedPage';
import SearchBar from '@/components/SearchBar';
import FeaturesSection from '@/components/FeaturesSection';
import AboutSection from '@/components/AboutSection';
import RateCard from '@/components/RateCard';
import { FaArrowRight } from 'react-icons/fa6';
import BrowsePreview from '@/components/BrowsePreview';
import Lenis from 'lenis'; // Corrected import statement

const HomePage = () => {
  const router = useRouter();
  const scrollRef = useRef(null);

  const handleReserveClick = () => {
    router.push('/search');
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const hash = window.location.hash;
    if (hash) {
      const section = document.querySelector(hash);
      if (section) {
        lenis.scrollTo(section);
      }
    }

    return () => lenis.destroy();
  }, []);

  return (
    <div className="w-full bg-neutral-900 -mt-16 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 h-screen">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold leading-tight tracking-tight">
          <span className="font-poppins text-5xl sm:text-7xl md:text-9xl tracking-widest bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-fade-in">
            THE CORNER
          </span>
        </h1>
        <span className="mt-4 block text-xl sm:text-3xl md:text-2xl font-light text-white tracking-widest">
          FOOD PLAZA
        </span>

        <div className="mt-8 w-full max-w-xs sm:max-w-md animate-fade-in delay-300">
          <SearchBar />
        </div>

        <button
          onClick={handleReserveClick}
          className="mt-8 px-8 py-3 text-lg sm:text-xl font-semibold tracking-wide bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-700 hover:to-fuchsia-700 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-3 animate-fade-in delay-500"
        >
          Browse <FaArrowRight className="text-white text-xl" />
        </button>
      </section>

      {/* Features Section */}
      <section className="py-12 -mt-40 bg-neutral-900">
        <div className="container mx-auto px-4">
          <FeaturesSection />
        </div>
      </section>

      {/* Food Stall / Menu Section */}
      <section id="browse" className="py-12 bg-neutral-900">
      <h2 className="text-lg sm:text-xl lg:mt-32 md:mt-32 text-center text-pink-600 font-light tracking-widest">
          Browse
        </h2>
        <p className="mt-4 text-2xl -mb-20 text-center sm:text-5xl font-extrabold leading-tight">
          What's in the Food Plaza?
        </p>
        <BrowsePreview />
      </section>

      {/* Featured Menu Section */}
      <section className="py-12 bg-neutral-900">
        <div className="container mx-auto px-4">
          <FeaturedPage />
        </div>
      </section>

      {/* Reviews Section */}
      <section
        id="reviews"
        className="py-12 flex-col items-center justify-center text-center bg-neutral-900"
      >
        <div className="text-center mb-12 px-4">
          <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">
            REVIEWS
          </h2>
          <p className="mt-4 text-3xl sm:text-5xl font-extrabold text-white">
            Your opinion is important
          </p>
        </div>
        <RateCard />
      </section>

      {/* About Us Section */}
      <section id="about-us" className="py-12 items-center justify-center bg-neutral-900">
        <div className="w-full">
          <AboutSection />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
