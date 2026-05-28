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
    <div className="w-full h-full">
      <Link
        href={href}
        className="group block w-full h-full bg-white"
      >
        <div className="flex flex-col w-full h-full border-1 border-neutral-950">

          {/* IMAGE */}
          <div className="relative w-full h-[420px] md:h-[650px] overflow-hidden bg-neutral-200 border-b-2 border-neutral-950">
            <img
              src={imageSrc}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* CONTENT */}
          <div className="p-8 md:p-12 bg-white flex flex-col justify-between items-start min-h-[260px]">
            <div>
              <span className="text-xs md:text-sm font-black tracking-[0.35em] text-red-600 uppercase mb-3 block">
                VENDORS CHOICE
              </span>

              <h2 className="text-3xl md:text-5xl font-black leading-[0.9] text-neutral-950 uppercase tracking-tighter max-w-4xl">
                {title}
              </h2>
            </div>

            <div
              className="
                mt-8
                inline-flex
                items-center
                justify-center
                px-10
                py-5
                bg-neutral-950
                text-white
                font-black
                uppercase
                text-sm
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