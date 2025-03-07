"use client";

import { useState } from "react";
import Image from "next/image";

const SpacesImage = ({ imageUrls }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };

  return (
    <div className="relative w-full">
      {/* Display the current image */}
      {imageUrls.length > 0 ? (
        <div
          className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg transition-transform duration-500 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={imageUrls[currentIndex]}
            alt={`Room image ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            className="rounded-lg transform transition-transform duration-500"
          />
          {/* Optional overlay with text */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <span className="text-white font-semibold text-lg">View Image</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/images/no-image.jpg"
            alt="No image available"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            className="rounded-lg"
          />
        </div>
      )}

      {/* Navigation buttons */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-200 transition duration-300"
      >
        &lt;
      </button>
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-200 transition duration-300"
      >
        &gt;
      </button>

      {/* Dots for navigation */}
      <div className="flex justify-center mt-2">
        {imageUrls.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 mx-1 rounded-full transition duration-300 ${
              currentIndex === index ? "bg-blue-500 transform scale-125" : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Modal for full image view */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative max-w-[90%] max-h-[90%]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-white text-2xl z-10"
            >
              ✖
            </button>
            <Image
              src={imageUrls[currentIndex]}
              alt={`Full view of image ${currentIndex + 1}`}
              width={800} // Set width
              height={600} // Set height
              style={{ objectFit: "contain" }}
              className="rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SpacesImage;
