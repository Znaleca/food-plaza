'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Press_Start_2P } from 'next/font/google';

const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
});

const Loading = ({ message = "PREPARING THE EXPERIENCE" }) => {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-white text-neutral-950 z-[9999] overflow-hidden selection:bg-red-600 selection:text-white">
      
      {/* Background Graphic: Repeating "BLITZ" watermark */}
      <div className="absolute inset-0 flex flex-col justify-center opacity-[0.03] pointer-events-none select-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap text-8xl font-black uppercase tracking-tighter leading-none">
            BLITZ FOODCOURT BLITZ FOODCOURT BLITZ FOODCOURT
          </div>
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative flex flex-col items-center">
        
        {/* Animated Bar Loader - Sharp Brutalist Style */}
        <div className="relative w-64 h-2 bg-neutral-100 border border-neutral-950 mb-12 overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-red-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>

        {/* Brand Title */}
        <div className="flex flex-col items-center overflow-hidden">
          <motion.h1
            className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-center"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            BLITZ
          </motion.h1>
          
          <motion.h2
            className="text-2xl md:text-4xl font-black uppercase tracking-[0.1em] mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            FOODCOURT
          </motion.h2>
          
          <motion.div 
            className="h-1.5 bg-neutral-950 w-full mt-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </div>

        {/* Status Message */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <motion.p
            className={`${pixelFont.className} text-[10px] md:text-xs tracking-[0.3em] text-neutral-400 uppercase`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {message}
          </motion.p>

          {/* Simple Square Progress Indicators */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-red-600"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Corner Accents - The "Frame" Look */}
      <div className="absolute top-10 left-10 w-12 h-12 border-t-4 border-l-4 border-neutral-950" />
      <div className="absolute top-10 right-10 w-12 h-12 border-t-4 border-r-4 border-neutral-950" />
      <div className="absolute bottom-10 left-10 w-12 h-12 border-b-4 border-l-4 border-neutral-950" />
      <div className="absolute bottom-10 right-10 w-12 h-12 border-b-4 border-r-4 border-neutral-950" />
      
    </div>
  );
};

export default Loading;