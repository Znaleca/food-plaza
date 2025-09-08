'use client';

// Removed Next.js imports that caused the compilation error.
// import Image from 'next/image';
// import Link from 'next/link';

const FeaturedCard = ({
  title,
  imageSrc,
  buttonText,
  href,
}) => {
  return (
    <div className="flex flex-col w-auto items-center justify-center p-4 sm:p-6 lg:py-0 h-full">
      {/* New Heading */}
      <div className="text-center mb-3 lg:mb-1">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light mb-10 tracking-widest">
          BROWSE
        </h2>
      </div>

      <a href={href} className="w-full h-full">
        {/* Main card container */}
        <div className="bg-neutral-900 border border-pink-600 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 w-full h-full cursor-pointer flex flex-col">
          
          {/* Image Container */}
          <div className="relative w-full flex-shrink-0">
            <img
              src={imageSrc}
              alt={title}
              className="object-cover w-full h-1/2 rounded-t-3xl transition duration-300"
            />
          </div>

          {/* Card Content */}
          <div className="p-5 text-left flex-grow flex flex-col justify-center items-start">
            <p className="mt-4 mb-10 lg:text-3xl md:text-3xl sm:text-xl font-extrabold leading-tight">
              CHECK OUT OUR MOST POPULAR PRODUCTS
            </p>
            <button
              className="mt-auto px-8 py-4 tracking-widest uppercase font-bold text-xs text-black rounded-full bg-white hover:bg-gray-200 shadow-lg transition-transform hover:scale-105"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </a>
    </div>
  );
};

export default FeaturedCard;