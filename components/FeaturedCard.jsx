'use client';

const FeaturedCard = ({ title, imageSrc, buttonText, href }) => {
  return (
    <div className="flex flex-col w-auto items-center justify-center p-4 md:py-1 sm:py-1 lg:py-1 h-full">
      <a href={href} className="w-full h-full">
        <div className="bg-neutral-950 border border-gray-400 rounded-3xl overflow-hidden
                transition-all duration-300 w-full h-full cursor-pointer flex flex-col
                hover:border-white">
          
          {/* Image */}
          <div className="relative w-full flex-grow">
            <img
              src={imageSrc}
              alt={title}
              className="object-cover w-full h-full rounded-t-3xl"
            />
          </div>

          {/* Content */}
          <div className="p-6 text-left flex-shrink-0 bg-neutral-950 min-h-[180px] flex flex-col justify-between">
            <p className="mb-6 lg:text-3xl md:text-3xl sm:text-xl font-extrabold leading-tight text-white">
              {title}
            </p>
            <p className="mb-6 lg:text-3xl md:text-3xl sm:text-xl font-extrabold leading-tight text-white">
              CHECK OUT OUR MOST POPULAR PRODUCTS
            </p>
            <button
              className="px-6 py-3 uppercase font-bold text-xs rounded-full 
                         bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white
                         hover:from-cyan-600 hover:to-fuchsia-600 
                         shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 self-start"
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
