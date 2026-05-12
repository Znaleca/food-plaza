'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'INITIALIZING SYSTEM' }) => {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-white text-neutral-950 z-[9999] px-6">
      <div className="max-w-md w-full">

        {/* Technical Header */}
        <div className="flex justify-between items-end mb-2">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            className="text-[10px] font-black uppercase tracking-[0.3em]"
          >
            {message}
          </motion.span>
          <span className="text-[10px] font-black font-mono">
            V2.0.26_BATAAN
          </span>
        </div>

        {/* Brutalist Progress Bar */}
        <div className="w-full h-12 border-4 border-neutral-950 relative overflow-hidden bg-neutral-100">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5
            }}
            className="absolute inset-0 bg-red-600"
          />

          {/* Decorative Grid Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 100%' }}
          />
        </div>

        {/* Bottom Metadata */}
        <div className="mt-4 flex flex-col gap-1">
          <div className="h-1 bg-neutral-950 w-full" />
          <div className="flex justify-between">
            <p className="text-[9px] font-bold uppercase tracking-tighter text-neutral-400">
              Blitz Foodcourt / Protocol Stack
            </p>
            <p className="text-[9px] font-bold uppercase tracking-tighter text-neutral-400">
              Status: Active
            </p>
          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
              className="w-4 h-4 bg-neutral-950"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;