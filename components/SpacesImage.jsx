"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaTimes, FaExpand } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SpacesImage = ({ imageUrls }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-0 md:px-0 my-12">
      {/* Brutalist Label */}
      <div className="inline-flex items-center gap-3 bg-neutral-950 text-white px-5 py-2 mb-[-4px] relative z-10 border-2 border-b-0 border-neutral-950 ml-6 md:ml-20">
        <div className="w-2 h-2 bg-red-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">LOGO PREVIEW</span>
      </div>

      {/* Main Image Container */}
      {imageUrls.length > 0 ? (
        <div
          className="relative w-full h-[350px] md:h-[500px] border-[6px] md:border-[8px] border-neutral-950 bg-neutral-100 overflow-hidden cursor-crosshair group mx-6 md:mx-20 max-w-[calc(100%-3rem)] md:max-w-[calc(100%-10rem)] transition-colors duration-300 hover:border-red-600"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={imageUrls[0]}
            alt="Space Preview"
            fill
            priority
            sizes="100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />

          {/* Brutalist UI Overlays */}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-white border-4 border-neutral-950 w-12 h-12 flex items-center justify-center text-neutral-950 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all duration-300">
              <FaExpand className="text-xl" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full bg-neutral-950 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t-4 border-red-600">
            <p className="text-white text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-3 h-3 bg-red-600 animate-pulse" /> VIEW FULL IMAGE
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-[350px] md:h-[500px] border-[6px] md:border-[8px] border-neutral-950 border-dashed mx-6 md:mx-20 max-w-[calc(100%-3rem)] md:max-w-[calc(100%-10rem)] flex flex-col items-center justify-center bg-neutral-50">
          <span className="text-xs font-black uppercase text-neutral-400 tracking-[0.4em]">NO IMAGE FOUND</span>
        </div>
      )}

      {/* Brutalist Lightbox Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col p-4 md:p-8"
            onClick={closeModal}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6 border-b-[6px] border-neutral-950 pb-6">
              <div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">FULL PREVIEW</h2>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-1.5 h-1.5 bg-red-600" />
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em]">High-Resolution Image</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-16 h-16 border-4 border-neutral-950 bg-white text-neutral-950 flex items-center justify-center hover:bg-neutral-950 hover:text-white transition-colors group flex-shrink-0"
                aria-label="Close"
              >
                <FaTimes size={32} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Image Stage */}
            <div
              className="relative flex-1 w-full border-[8px] border-neutral-950 bg-neutral-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={imageUrls[0]}
                alt="Full space view"
                fill
                sizes="100vw"
                className="object-contain p-2 md:p-6"
              />

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-red-600 m-2" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-red-600 m-2" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-red-600 m-2" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-red-600 m-2" />
            </div>

            {/* Modal Footer Metadata */}
            <div className="mt-6 flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-950">IMAGE PREVIEW</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-red-600 text-white px-3 py-1">PREVIEW ACTIVE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpacesImage;