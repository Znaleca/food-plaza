"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";

const SpacesImage = ({ imageUrls }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Allow Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <div className="relative w-full mx-0">
      {/* Image Display */}
      {imageUrls.length > 0 ? (
        <div
          className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={imageUrls[0]} // Always use the first image
            alt="Room image"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 rounded-xl group-hover:scale-105"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white font-semibold text-sm sm:text-lg">Click to View</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-80 sm:h-96 bg-neutral-800 flex items-center justify-center rounded-xl text-white text-sm sm:text-lg">
          No Images Available
        </div>
      )}

      {/* Modal View */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-0"
          onClick={closeModal}
        >
          <div
            className="relative w-full h-full max-h-full rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-xl hover:text-pink-400 transition z-10"
              aria-label="Close Modal"
            >
              <FaTimes />
            </button>
            <Image
              src={imageUrls[0]} // Always use the first image
              alt="Full view of image"
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
              className="w-full h-auto max-h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SpacesImage;