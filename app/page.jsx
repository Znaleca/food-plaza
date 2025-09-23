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

      {/* Food Stall / Menu Section */}
      <section id="browse" className=" py-4 bg-neutral-950">
        <BrowsePreview />
      </section>
      {/* Featured Menu Section */}
      <div className="w-full mx-auto">
          <FeaturedPage />
        </div>

      <div className=" -mt-52 w-full mx-auto">
          <FeaturesSection />
        </div>

      {/* Reviews Section */}
      <section
        id="reviews"
        className="py-12 flex-col items-center justify-center text-center bg-neutral-950"
      >
        <div className="text-center -mt-40 mb-28 px-4">
        <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            REVIEWS
          </h2>
          <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Your opinion is{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              important
            </span>
          </p>
        </div>
        <RateCard />
      </section>

      {/* About Us Section */}
      <section id="about-us" className="py-12 items-center justify-center bg-neutral-950">
        <div className="w-full">
          <AboutSection />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
