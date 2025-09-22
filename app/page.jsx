'use client';

import React, { useEffect } from 'react';
import FeaturedPage from '@/components/FeaturedPage';
import FeaturesSection from '@/components/FeaturesSection';
import AboutSection from '@/components/AboutSection';
import RateCard from '@/components/RateCard';
import BrowsePreview from '@/components/BrowsePreview';
import Lenis from 'lenis';
import HomePreview from '@/components/HomePreview';

const HomePage = () => {
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

    return () => lenis.destroy();
  }, []);

  return (
    <div className="w-full -mt-36 bg-neutral-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <HomePreview />

      {/* Features Section */}
      <section className=" mb-44 bg-stone-900">
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
      <section className="py-12 bg-stone-900">
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
