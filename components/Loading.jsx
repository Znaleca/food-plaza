'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PropagateLoader } from 'react-spinners';
import Image from 'next/image';
import { Press_Start_2P } from 'next/font/google';

// Pixel font import
const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
});

const Loading = ({ message = "Loading..." }) => {
  const neonPink = '#ff4da6';

  const textVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { repeat: Infinity, duration: 1.5 },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-black text-white z-50 overflow-hidden">
      {/* Fullscreen GIF background */}
      <Image
        src="/images/pixel-eating.gif"
        alt="Pixel man eating"
        fill
        className="object-cover pixelated opacity-70"
        priority
      />

      {/* Overlay content */}
      <div className="relative flex flex-col justify-center items-center text-center">
        {/* THE CORNER Title */}
        <motion.h1
          className={`${pixelFont.className} text-xl sm:text-3xl md:text-5xl lg:text-6xl text-pink-500 drop-shadow-[0_0_10px_rgba(255,77,166,0.9)]`}
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          style={{ imageRendering: "pixelated" }}
        >
          THE CORNER
        </motion.h1>

        {/* Retro spinner */}
        <div className="flex items-center mt-10">
          <PropagateLoader color={neonPink} size={15} speedMultiplier={1.3} />
        </div>

        {/* Loading message */}
        <motion.p
          className={`${pixelFont.className} mt-8 text-xs sm:text-sm md:text-base text-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.8)] tracking-widest`}
          variants={textVariants}
          animate="animate"
          style={{ imageRendering: "pixelated" }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default Loading;
