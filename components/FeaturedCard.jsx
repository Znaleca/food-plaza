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
    <div className="flex flex-col items-center justify-center p-4">
      {/* New Heading */}
      <div className="text-center mb-6">
        <h2 className="text-lg sm:text-1xl text-pink-600 font-light mb-10 tracking-widest">
            BROWSE
        </h2>
        <p className="mt-4 text-3xl lg:text-3xl md:text-4xl sm:text-5xl font-extrabold leading-tight">
            CHECK OUT OUR MOST POPULAR PRODUCTS
        </p>
      </div>

      <a href={href} className="w-full">
        {/* Main card container */}
        <div className="bg-neutral-900 border border-pink-600 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 w-full cursor-pointer flex flex-col">
          
          {/* Image Container - The image will now scale correctly within the card */}
          <div className="relative w-full overflow-hidden">
            <img
              src={imageSrc}
              alt={title}
              className="object-cover w-full h-auto rounded-t-3xl transition duration-300 flex-shrink-0"
            />
          </div>

          {/* Card Content - The flex-grow helps this section take up available space */}
          <div className="p-5 text-center flex-grow flex flex-col justify-center items-center">
            <button
              className="mt-auto px-8 py-4 tracking-widest uppercase font-bold text-lg text-black rounded-full bg-white hover:bg-gray-200 shadow-lg transition-transform hover:scale-105"
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