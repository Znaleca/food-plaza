"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

const SpacesImage = ({ imageUrls }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

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
    <div className="relative w-full">
      {/* Image Display */}
      {imageUrls.length > 0 ? (
        <div
          className="relative w-full h-96 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={imageUrls[currentIndex]}
            alt={`Room image ${currentIndex + 1}`}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 rounded-xl group-hover:scale-105"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white font-semibold text-lg">Click to View</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-96 bg-neutral-800 flex items-center justify-center rounded-xl text-white text-lg">
          No Images Available
        </div>
      )}

      {/* Nav Arrows */}
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-80 transition"
            aria-label="Previous Image"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-80 transition"
            aria-label="Next Image"
          >
            <FaChevronRight />
          </button>
        </>
      )}

      {/* Dot Navigation */}
      <div className="flex justify-center mt-3 space-x-2">
        {imageUrls.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition duration-300 ${
              currentIndex === index ? "bg-pink-500 scale-110" : "bg-gray-400 hover:bg-gray-500"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Modal View */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-white text-xl hover:text-pink-400 transition z-10"
              aria-label="Close Modal"
            >
              <FaTimes />
            </button>
            <Image
              src={imageUrls[currentIndex]}
              alt={`Full view of image ${currentIndex + 1}`}
              width={1200}
              height={800}
              style={{ objectFit: "contain" }}
              className="w-full h-auto max-h-[90vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SpacesImage;
