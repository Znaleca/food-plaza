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

// Features data
const features = [
  { icon: MdOutlineAccessTime, text: 'FAST ORDERING' },
  { icon: MdShoppingCartCheckout, text: 'ONE-TIME CHECKOUT' },
  { icon: MdSms, text: 'SMS UPDATES' },
  { icon: MdDiscount, text: 'PWD & SENIOR DISCOUNTS' },
];

const HomePreview = () => {
  const router = useRouter();

  const handleOrderClick = () => {
    router.push('/search');
  };

  return (
    <section className="relative w-full min-h-screen bg-neutral-950 text-white overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/homepreview.jpg"
          alt="Food Stall Background"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-neutral-950/80" /> {/* dark overlay */}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center flex-grow px-4 sm:px-8 md:px-16 lg:px-32 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto mt-10 md:mx-0 text-center md:text-left">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            Find something{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              for your crave
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl">
            Browse food stalls, explore menus, and order in seconds while enjoying live vibes.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleOrderClick}
            className="group mt-6 sm:mt-8 inline-flex items-center gap-2 px-5 py-2.5 text-sm sm:text-base font-semibold rounded-full
                       bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600
                       shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <span>Order Now</span>
            <FaArrowRight className="transition-transform group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>

      {/* Feature Row */}
      <div className="relative z-10 py-6 sm:py-8 px-4 sm:px-12 lg:px-20 bg-neutral-950 border-t border-neutral-800">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          {features.map((feature, index) => (
            <FeatureItem key={index} icon={feature.icon} text={feature.text} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center text-center">
    <div className="text-4xl text-white mb-2">
      <Icon />
    </div>
    <span className="text-sm sm:text-base font-medium text-gray-300 tracking-wide">
      {text}
    </span>
  </div>
);

export default HomePreview;
