'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

const categories = [
  { name: 'Meals', image: '/images/Meals.png' },
  { name: 'Snacks', image: '/images/Snacks.png' },
  { name: 'Drinks', image: '/images/Drinks.png' },
  { name: 'Dessert', image: '/images/Dessert.png' },
  { name: 'Add-ons', image: '/images/Add-ons.png' },
];

const FeaturedPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-60%']);

  return (
    <div className="bg-neutral-950 text-white min-h-screen">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* Header */}
        <header className="absolute top-16 left-1/2 -translate-x-1/2 text-center z-10 w-full px-6">
          <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            CATEGORIES
          </h2>
          <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Your cravings, {' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
             sorted
            </span>
          </p>
        </header>

        {/* Horizontal Scroll */}
        <motion.div
          ref={containerRef}
          style={{ x }}
          className="flex flex-nowrap gap-10 sm:gap-14 ml-[12vw] pr-[25vw]"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative group flex-shrink-0 w-[22rem] sm:w-[28rem] h-56 sm:h-64 rounded-2xl bg-neutral-950/60 backdrop-blur-md border border-gray-400 hover:border-white shadow-md hover:shadow-cyan-600/30 transition-all duration-500 overflow-hidden"
            >
              <Link
                href={`/search?category=${encodeURIComponent(cat.name)}&displayType=Menus`}
                className="flex items-center justify-between h-full w-full px-6"
              >
                {/* Text */}
                <h3 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-pink-400 transition-colors duration-300">
                  {cat.name}
                </h3>

                {/* Image */}
                <div className="relative w-28 h-28 sm:w-40 sm:h-40">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedPage;
