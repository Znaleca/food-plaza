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
    offset: ['start end', 'end start'],
  });

  // Moves the group slightly from right to left to create a centered gliding effect
  const x = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <div 
      ref={containerRef} 
      className="relative h-[150vh] bg-white border-t-4 border-black z-20"
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
        {/* Massive Brutalist Header */}
        <header className="w-full text-center mb-8 md:mb-12 z-10 shrink-0 px-6">
          <span className="text-xs font-bold tracking-[0.4em] text-red-600 uppercase">
            COLLECTIONS
          </span>
          <h2 className="mt-4 text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-black">
            YOUR CRAVINGS, <br />
            <span 
              className="text-transparent" 
              style={{ WebkitTextStroke: '2px #000' }}
            >
              SORTED.
            </span>
          </h2>
        </header>

        {/* Categories Section */}
        <div className="relative w-full flex justify-center">
          <motion.div
            style={{ x }}
            className="flex flex-nowrap gap-0"
          >
            {categories.map((cat, index) => (
              <div
                key={cat.name}
                // Size: 18rem width is the sweet spot for 5 cards to stay visible
                className={`relative flex-shrink-0 w-[14rem] md:w-[18rem] h-[20rem] md:h-[26rem] bg-white border-y-4 border-r-4 border-black flex flex-col group transition-colors duration-300 hover:bg-black ${
                  index === 0 ? 'border-l-4' : ''
                }`}
              >
                <Link
                  href={`/search?category=${encodeURIComponent(cat.name)}&displayType=Menus`}
                  className="relative flex flex-col h-full w-full p-5 md:p-8 justify-between"
                >
                  <span className="text-xs font-black tracking-widest text-black group-hover:text-red-600 transition-colors">
                    0{index + 1}
                  </span>

                  {/* Product Image */}
                  <div className="relative w-full h-32 md:h-44 my-3">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                    />
                  </div>

                  {/* Card Bottom: Title & Arrow */}
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter group-hover:text-white transition-colors">
                      {cat.name}
                    </h3>
                    <div className="h-8 w-8 md:h-10 md:w-10 border-2 border-black group-hover:border-white group-hover:bg-red-600 flex items-center justify-center transition-all">
                      <span className="text-lg md:text-xl font-bold group-hover:text-white">→</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Progress Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-black/10">
          <motion.div 
            style={{ scaleX: scrollYProgress }} 
            className="h-full bg-red-600 origin-left"
          />
        </div>

      </div>
    </div>
  );
};

export default FeaturedPage;