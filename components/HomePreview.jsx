'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowRight } from 'react-icons/fa6';

const HomePreview = () => {
  const router = useRouter();

  return (
    <section className="relative w-full min-h-screen bg-white text-neutral-950 overflow-hidden flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* Background Decorative Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03] leading-none z-0">
        <h2 className="text-[30vw] font-black tracking-tighter uppercase">CRAVE</h2>
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col justify-center items-center flex-grow px-6 text-center pt-32 pb-20">
        <div className="max-w-5xl">
          <span className="text-xs sm:text-sm font-black tracking-[0.5em] text-red-600 uppercase mb-6 block">
            THE ULTIMATE FOOD HUB
          </span>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black leading-[0.8] text-neutral-950 uppercase tracking-tighter">
            DON'T JUST EAT.<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #0a0a0a' }}>
              SAVOR IT.
            </span>
          </h1>

          <div className="flex justify-center my-8 md:my-12">
            <div className="h-3 md:h-4 w-32 md:w-40 bg-neutral-950" />
          </div>

          <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto font-medium leading-tight lowercase italic">
            Skip the lines. Browse your favorite stalls, <br className="hidden sm:block" />
            explore the menu, and order in a heartbeat.
          </p>

          <button
            onClick={() => router.push('/search')}
            className="group mt-10 md:mt-12 inline-flex items-center gap-6 px-10 py-5 md:px-12 md:py-6 bg-neutral-950 text-white font-black uppercase tracking-[0.2em] text-xs md:text-sm hover:bg-red-600 transition-all duration-300 active:scale-95 border-4 border-neutral-950"
          >
            <span>START YOUR ORDER</span>
            <FaArrowRight className="text-lg md:text-xl transition-transform group-hover:translate-x-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomePreview;