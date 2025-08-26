'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  // Gradient-inspired colors
  const neonStart = '#f472b6'; // pink-500
  const neonMiddle = '#a855f7'; // purple-500
  const neonEnd = '#6366f1'; // indigo-500

  const textVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { repeat: Infinity, duration: 1.5 },
    },
  };

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-neutral-900 text-white z-50">
      {/* Gradient Neon Circle Spinner */}
      <div className="relative w-20 h-20">
        <div
          className="absolute inset-0 rounded-full border-4 animate-spin"
          style={{
            borderTopColor: neonStart,
            borderRightColor: neonMiddle,
            borderBottomColor: 'transparent',
            borderLeftColor: neonEnd,
          }}
        ></div>
        <div
          className="absolute inset-2 rounded-full border-2 animate-spin-slow"
          style={{
            borderTopColor: neonMiddle,
            borderRightColor: neonEnd,
            borderBottomColor: 'transparent',
            borderLeftColor: neonStart,
          }}
        ></div>
      </div>

      {/* Neon Loading Message */}
      <motion.p
        className="mt-6 text-sm sm:text-base md:text-lg tracking-widest font-semibold text-white drop-shadow-[0_0_12px_rgba(245,158,255,0.8)]"
        variants={textVariants}
        animate="animate"
      >
        {message}
      </motion.p>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
