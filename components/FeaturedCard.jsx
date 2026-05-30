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
    // Replaced standard auto height with a smart viewport calculation minus minimal margins
    <div className="w-full lg:h-[calc(100vh-5rem)] min-h-[500px] lg:min-h-[unset]">
      <Link
        href={href}
        className="group block w-full h-full bg-white"
      >
        {/* flex-col ensures image and content dynamically balance out to fill 100% height */}
        <div className="flex flex-col w-full h-full">

          {/* IMAGE - flex-1 forces it to greedily occupy every available pixel down to the text area */}
          <div className="relative w-full flex-1 min-h-[250px] overflow-hidden bg-neutral-200 border-b-2 border-neutral-950">
            <img
              src={imageSrc}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* CONTENT - Snug padding and compressed layout to preserve maximum window footprint */}
          <div className="p-6 md:p-8 bg-white flex flex-col justify-between items-start shrink-0">
            <div>
              <span className="text-xs font-black tracking-[0.35em] text-red-600 uppercase mb-2 block">
                VENDORS CHOICE
              </span>

              <h2 className="text-2xl md:text-4xl font-black leading-[0.95] text-neutral-950 uppercase tracking-tighter max-w-4xl">
                {title}
              </h2>
            </div>

            <div
              className="
                mt-5
                inline-flex
                items-center
                justify-center
                px-8
                py-4
                bg-neutral-950
                text-white
                font-black
                uppercase
                text-xs
                tracking-[0.2em]
                transition-all
                duration-300
                group-hover:bg-red-600
              "
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