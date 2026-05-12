'use client';

import React from 'react';
import Image from 'next/image';
import { FaUtensils, FaLeaf, FaLightbulb } from 'react-icons/fa';
import logo from '@/assets/images/logo.svg';

const coreValues = [
  { 
    icon: FaUtensils, 
    title: 'COMMUNITY', 
    description: 'A vibrant hub where food lovers gather to share experiences and create memories.' 
  },
  { 
    icon: FaLeaf, 
    title: 'QUALITY', 
    description: 'We prioritize fresh, locally-sourced ingredients to ensure every dish is top-tier.' 
  },
  { 
    icon: FaLightbulb, 
    title: 'INNOVATION', 
    description: 'Our vendors embrace creativity, offering unique flavors you won\'t find elsewhere.' 
  },
];

const AboutSection = () => {
  return (
    <section className="w-full bg-white text-neutral-950 font-sans selection:bg-red-600 selection:text-white border-b-[8px] border-neutral-950">
      
      {/* 1. INTRO / THE "WHO WE ARE" SECTION */}
      <div className="flex flex-col lg:flex-row border-t-[8px] border-neutral-950">
        <div className="lg:w-2/3 p-8 md:p-16 lg:p-24 border-b-4 lg:border-b-0 lg:border-r-4 border-neutral-950">
          <span className="inline-block bg-red-600 text-white px-3 py-1 text-xs font-black tracking-widest uppercase mb-6">
            Our Origin
          </span>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.8] tracking-tighter mb-12">
            The <br/> Blitz <br/> <span className="text-red-600 italic">Era.</span>
          </h1>
          <div className="max-w-xl">
            <p className="text-2xl md:text-3xl font-bold uppercase leading-tight mb-6">
              Founded in 2024, Blitz was born from a simple obsession: Why settle for ordinary food when you can have a revolution?
            </p>
            <p className="text-lg font-medium text-neutral-600 leading-relaxed">
              We started as a small collective of chefs who were tired of the "cookie-cutter" dining experience. Today, we are a curated food court—a brutalist sanctuary for flavor, culture, and community. We don't just host vendors; we amplify visionaries.
            </p>
          </div>
        </div>

        {/* SIDEBAR MANIFESTO */}
        <div className="lg:w-1/3 bg-neutral-950 text-white p-8 md:p-16 flex flex-col justify-between">
          <div className="relative">
            <Image 
              src={logo} 
              alt="Logo" 
              className="w-24 h-24 mb-12 animate-pulse" 
            />
            <h2 className="text-4xl font-black uppercase tracking-tighter italic border-b-4 border-red-600 pb-4 mb-8">
              The Manifesto
            </h2>
            <ul className="space-y-6 text-sm font-black tracking-widest uppercase">
              <li className="flex items-start gap-4">
                <span className="text-red-600">01</span>
                <span>Support Local or Stay Home</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-red-600">02</span>
                <span>Flavor is Non-Negotiable</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-red-600">03</span>
                <span>Design for the People</span>
              </li>
            </ul>
          </div>
          <div className="mt-20">
            <p className="text-xs font-mono opacity-50 tracking-tighter uppercase">
              Ver. 1.0.4 // Registered Trademarks 2024
            </p>
          </div>
        </div>
      </div>

      {/* 2. VALUE STRIP (Vertical Title Style) */}
      <div className="flex flex-col lg:flex-row border-t-4 border-neutral-950 overflow-hidden">
        <div className="bg-red-600 text-white p-6 lg:p-10 flex items-center justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-neutral-950">
          <h2 className="text-3xl lg:text-5xl font-black uppercase lg:-rotate-180 lg:[writing-mode:vertical-lr] tracking-tighter whitespace-nowrap">
            What We Stand For
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3">
          {coreValues.map((value, idx) => {
            const Icon = value.icon;
            return (
              <div key={idx} className="p-10 border-b-4 md:border-b-0 md:border-r-4 last:border-r-0 border-neutral-950 hover:bg-neutral-50 transition-colors group">
                <Icon className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">{value.title}</h3>
                <p className="text-sm font-bold uppercase leading-snug text-neutral-600">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. "IN NUMBERS" STATS SECTION - Now the Final Footer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-neutral-950 text-white border-t-4 border-neutral-950">
        {[
          { label: 'Vendors', val: '24+' },
          { label: 'Daily Guests', val: '1.2k' },
          { label: 'Events / Year', val: '50+' },
          { label: 'Happy Souls', val: '100%' },
        ].map((stat, i) => (
          <div key={i} className="p-8 md:p-12 border-r-2 border-b-2 border-neutral-800 flex flex-col items-center justify-center text-center hover:bg-red-600 transition-colors duration-200 cursor-default">
            <span className="text-4xl md:text-6xl font-black text-white mb-2">{stat.val}</span>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60">{stat.label}</span>
          </div>
        ))}
      </div>

    </section>
  );
};

export default AboutSection;