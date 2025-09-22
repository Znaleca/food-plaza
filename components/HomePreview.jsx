'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa6';
import {
  MdOutlineAccessTime,
  MdShoppingCartCheckout,
  MdSms,
  MdDiscount,
} from 'react-icons/md';

// A single source of truth for all feature data
const features = [
  { icon: <MdOutlineAccessTime />, text: 'FAST ORDERING' },
  { icon: <MdShoppingCartCheckout />, text: 'ONE-TIME CHECKOUT' },
  { icon: <MdSms />, text: 'SMS ORDER UPDATES' },
  { icon: <MdDiscount />, text: 'PWD & SENIOR DISCOUNTS' },
];

const HomePreview = () => {
  const router = useRouter();

  const handleOrderClick = () => {
    router.push('/search');
  };

  return (
    <section className="relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/homepreview.jpg"
          alt="Food Stall Background"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col justify-center flex-grow px-6 sm:px-12 lg:px-16">
        <div className="max-w-3xl">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            <span className="font-poppins bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
              FOOD STALLS WITH LIVE BANDS.
            </span>
          </h1>
          {/* Subheading */}
          <p className="mt-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white/90">
  EAT, JAM & ORDER IN SECONDS.
</p>

          {/* Call to Action Button */}
          <button
            onClick={handleOrderClick}
            className="group mt-8 inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg
                       bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700
                       shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <span>Order Now</span>
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Feature Row */}
      <div className="relative z-10 py-6 px-6 sm:px-12 lg:px-16 border-t border-gray-800 bg-black/70 backdrop-blur-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <FeatureItem key={index} icon={feature.icon} text={feature.text} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center text-center">
    <div className="text-3xl text-pink-400 mb-2">{icon}</div>
    <span className="text-sm sm:text-base font-light text-gray-300 tracking-wide">
      {text}
    </span>
  </div>
);

export default HomePreview;
