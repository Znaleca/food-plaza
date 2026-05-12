'use client';

import React from 'react';
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
} from 'react-icons/fa';

const ContactPage = () => {
  return (
    <div className="w-full min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white px-6 pt-32 pb-24">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <h1 className="text-6xl md:text-9xl font-[1000] uppercase tracking-tighter leading-[0.8] mb-6">
          GET IN<br />TOUCH
        </h1>
        <div className="h-4 w-32 bg-red-600" />
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 border-4 border-neutral-950">
        
        {/* Left Column: Intro Message */}
        <div className="md:col-span-4 p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-neutral-950 bg-neutral-50 flex flex-col justify-center">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Connect</h2>
          <p className="text-lg font-medium leading-relaxed text-neutral-600 italic">
            "Design is a silent ambassador of your brand."
          </p>
          <p className="mt-4 text-neutral-500 font-bold uppercase text-xs tracking-widest">
            — Blitz Foodcourt Studio
          </p>
        </div>

        {/* Right Column: Contact Details (3-Section Grid) */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3">
          
          {/* Email Card */}
          <div className="p-8 border-b-4 sm:border-b-0 sm:border-r-4 border-neutral-950 flex flex-col justify-between hover:bg-neutral-950 hover:text-white transition-all group">
            <FaEnvelope className="text-3xl mb-12 text-red-600 group-hover:text-white" />
            <div>
              <span className="block text-xs font-black uppercase tracking-widest mb-2 opacity-50">Direct Mail</span>
              <a href="mailto:bernardlanzdeleon@gmail.com" className="text-sm lg:text-base font-bold break-words leading-tight">
                bernardlanzdeleon@gmail.com
              </a>
            </div>
          </div>

          {/* Portfolio Card */}
          <div className="p-8 border-b-4 sm:border-b-0 sm:border-r-4 border-neutral-950 flex flex-col justify-between hover:bg-neutral-950 hover:text-white transition-all group">
            <FaGlobe className="text-3xl mb-12 text-red-600 group-hover:text-white" />
            <div>
              <span className="block text-xs font-black uppercase tracking-widest mb-2 opacity-50">Portfolio</span>
              <a href="https://acelanzstudio.vercel.app" target="_blank" className="text-sm lg:text-base font-bold underline decoration-red-600 decoration-2 underline-offset-4 group-hover:decoration-white">
                acelanzstudio.vercel.app
              </a>
            </div>
          </div>

          {/* Location Card */}
          <div className="p-8 flex flex-col justify-between hover:bg-neutral-950 hover:text-white transition-all group">
            <FaMapMarkerAlt className="text-3xl mb-12 text-red-600 group-hover:text-white" />
            <div>
              <span className="block text-xs font-black uppercase tracking-widest mb-2 opacity-50">Base</span>
              <p className="text-sm lg:text-base font-bold uppercase">
                Bataan,<br />Philippines
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Footer Detail */}
      <div className="max-w-7xl mx-auto mt-12 flex justify-between items-end">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
          Blitz Foodcourt • Curated Experience
        </div>
        <div className="flex gap-2">
            <div className="w-8 h-8 border-2 border-neutral-950" />
            <div className="w-8 h-8 bg-neutral-950" />
            <div className="w-8 h-8 bg-red-600" />
        </div>
      </div>
      
    </div>
  );
};

export default ContactPage;