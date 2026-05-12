'use client';

import React from 'react';
import { FaUtensils, FaLeaf, FaLightbulb } from 'react-icons/fa';

const coreValues = [
  { 
    icon: FaUtensils, 
    title: 'COMMUNITY', 
    description: 'A vibrant hub where food lovers gather to share experiences and create lasting memories.' 
  },
  { 
    icon: FaLeaf, 
    title: 'QUALITY', 
    description: 'We prioritize fresh, locally-sourced ingredients to ensure every dish meets our high standards.' 
  },
  { 
    icon: FaLightbulb, 
    title: 'INNOVATION', 
    description: 'Our vendors embrace culinary creativity, offering unique flavors you won\'t find anywhere else.' 
  },
];

const AboutSection = () => {
  return (
    <div className="w-full min-h-screen bg-white text-neutral-900 p-8 font-sans selection:bg-red-600 selection:text-white">
      
      {/* Header Section */}
      <section className="mt-16 text-center mb-24 px-4">
        <header>
          <span className="text-xs font-bold tracking-[0.4em] text-red-600 uppercase">
            ESTABLISHED 2024
          </span>
          <h1 className="mt-4 text-6xl sm:text-8xl font-black tracking-tighter text-neutral-950 uppercase">
            FOOD PLAZA
          </h1>
          <div className="h-2 w-24 bg-neutral-950 mx-auto mt-6 mb-8" />
          <p className="max-w-2xl mx-auto text-neutral-600 text-lg sm:text-xl leading-relaxed font-medium">
            A curated culinary destination. We bring together 
            passionate vendors serving fresh, flavorful dishes in a 
            modern, inclusive atmosphere.
          </p>
        </header>
      </section>

      {/* Grid Section - Solid Borders */}
      <section className="max-w-6xl mx-auto mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 border-4 border-neutral-950">
          {coreValues.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className={`p-12 flex flex-col items-center text-center transition-all duration-300 hover:bg-neutral-950 hover:text-white group
                ${index !== coreValues.length - 1 ? 'border-b-4 md:border-b-0 md:border-r-4 border-neutral-950' : ''}`}
              >
                <div className="mb-8 p-4 rounded-full border-2 border-neutral-950 group-hover:border-white group-hover:rotate-12 transition-all duration-300">
                  <Icon className="text-3xl" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-widest italic">
                  {value.title}
                </h3>
                <p className="text-sm leading-loose font-semibold opacity-70 group-hover:opacity-100 transition-opacity">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Note */}
      <section className="text-center max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl sm:text-4xl font-black mb-10 text-neutral-950 leading-tight uppercase tracking-tight">
          Unforgettable food. <br/>
          Friendly vibes. <br/>
          Local flavors.
        </h2>
        <button className="px-12 py-5 bg-neutral-950 text-white font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-colors duration-300 active:scale-95">
          Explore the Plaza
        </button>
      </section>
      
    </div>
  );
};

export default AboutSection;