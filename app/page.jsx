'use client';

import React, { useEffect } from 'react';
import FeaturedPage from '@/components/FeaturedPage';
import FeaturesSection from '@/components/FeaturesSection';
import AboutSection from '@/components/AboutSection';
import RateCard from '@/components/RateCard';
import BrowsePreview from '@/components/BrowsePreview';
import HomePreview from '@/components/HomePreview';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const HomePage = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', ScrollTrigger.update);

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col w-full bg-white overflow-x-hidden selection:bg-red-600 selection:text-white">
      
      {/* 1. Hero Section */}
      <section className="relative z-20 w-full min-h-screen bg-white">
        <HomePreview />
      </section>

      {/* 2. Capabilities Section */}
      <section className="relative z-20 w-full bg-white">
        <FeaturesSection />
      </section>

      {/* 3. Food Stall Section */}
      <section className="relative z-10 w-full bg-white">
        <BrowsePreview />
      </section>

      {/* 4. Featured Horizontal Scroll */}
      <section className="relative z-20">
        <FeaturedPage />
      </section>

      {/* 5. About Us Section (SWAPPED) */}
      <section id="about-us" className="relative z-20 w-full border-t-4 border-neutral-950 bg-white">
        <AboutSection />
      </section>

      {/* 6. Feedback Section (SWAPPED) */}
      <section id="reviews" className="relative z-20 w-full border-t-4 border-neutral-950 bg-white">
        <RateCard />
      </section>
      
    </div>
  );
};

export default HomePage;