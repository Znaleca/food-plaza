'use client';

import React from 'react';
import Link from 'next/link';

const FeaturedCard = ({ 
  title = "CHECK OUT OUR MOST POPULAR PRODUCTS", 
  imageSrc, 
  buttonText = "ORDER NOW", 
  href = "#" 
}) => {
  return (
    <div className="w-full h-full p-0">
      {/* 1. Replaced <a> with Next.js <Link> for faster client-side routing */}
      <Link href={href} className="group block w-full h-full bg-white">
        <div className="flex flex-col w-full h-full transition-all duration-300">
          
          {/* Image - No Rounded Corners */}
          <div className="relative w-full flex-grow bg-neutral-100 overflow-hidden border-b-4 border-neutral-950">
            <img
              src={imageSrc}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Content - Modern Editorial Style */}
          <div className="p-8 text-left bg-white min-h-[220px] flex flex-col justify-between items-start">
            <div>
              <span className="text-xs font-black tracking-[0.3em] text-red-600 uppercase mb-2 block">
                VENDORS CHOICE
              </span>
              {/* 2. Replaced hardcoded text with the 'title' prop */}
              <h2 className="text-3xl md:text-4xl font-black leading-[0.9] text-neutral-950 uppercase tracking-tighter">
                {title}
              </h2>
            </div>
            
            {/* 3. Changed <button> to a <div> to prevent invalid HTML nesting (button inside a link). 
                   Added group-hover so it highlights when the card is hovered. */}
            <div
              className="mt-6 inline-block px-8 py-4 bg-neutral-950 text-white font-black uppercase text-sm tracking-widest
                         group-hover:bg-red-600 transition-colors duration-300 border-none"
            >
              {buttonText}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FeaturedCard;