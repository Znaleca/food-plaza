'use client';

const FeaturedCard = ({
  title,
  imageSrc,
  buttonText,
  href,
}) => {
  return (
    <div className="flex flex-col w-auto items-center justify-center p-4 md:py-1 sm:py-1 lg:py-1 h-full">
      {/* New Heading */}
      <div className="text-center mb-3 lg:mb-1">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light mb-10 tracking-widest">
          BROWSE
        </h2>
      </div>

      <a href={href} className="w-full h-full">
        {/* Main card container */}
        <div className="bg-neutral-900 border border-pink-600 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 w-full h-full cursor-pointer flex flex-col">
          
          {/* Image Container - stretches */}
          <div className="relative w-full flex-grow">
            <img
              src={imageSrc}
              alt={title}
              className="object-cover w-full h-full rounded-t-3xl transition duration-300"
            />
          </div>

          {/* Fixed Content - always visible */}
          <div className="p-6 text-left flex-shrink-0 bg-neutral-900 min-h-[180px] flex flex-col justify-between">
            <p className="mb-6 lg:text-3xl md:text-3xl sm:text-xl font-extrabold leading-tight text-white">
              CHECK OUT OUR MOST POPULAR PRODUCTS
            </p>
            <button
              className="px-8 py-4 tracking-normal uppercase font-bold text-xs text-black rounded-full bg-white hover:bg-gray-200 shadow-lg transition-transform hover:scale-105"
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
