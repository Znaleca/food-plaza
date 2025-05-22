
'use client';

import Image from 'next/image';
import Link from 'next/link';

const FeaturesPage = () => {
  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center">

      {/* Header Section */}
      <div className="mt-12 sm:mt-16 text-center mb-8 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">Features</h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">Explore Food Plaza</p>
      </div>

      {/* Mission Statement Section */}
      <div className="text-center max-w-3xl mx-auto mb-8 px-4">
        <p className="text-lg sm:text-xl font-light text-gray-400">
        At the heart of The Corner, our food plaza brings together a vibrant collection of food stalls, each offering a unique and flavorful menu.
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-5xl w-full text-center mb-8">

        {/* Menu */}
        <Link href="/?view=menu" className="group flex flex-col items-center text-gray-200 hover:text-pink-700 transition duration-300 ease-in-out">
          <div className="w-28 h-28 rounded-full bg-neutral-900 border-4 border-pink-600 flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 group-hover:shadow-pink-500/50 transition-transform duration-300">
            <Image 
              src="/images/menu.png" 
              alt="Menu" 
              width={64} 
              height={64} 
            />
          </div>
          <span className="font-semibold text-base sm:text-lg">Menu</span>
          <p className="text-sm text-gray-400 mt-1">Browse our diverse food options.</p>
        </Link>

        {/* Stalls */}
        <Link href="/?view=stall" className="group flex flex-col items-center text-gray-200 hover:text-pink-700 transition duration-300 ease-in-out">
          <div className="w-28 h-28 rounded-full bg-neutral-900 border-4 border-pink-600 flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 group-hover:shadow-pink-500/50 transition-transform duration-300">
            <Image 
              src="/images/stall.png" 
              alt="Food Stalls" 
              width={64} 
              height={64} 
            />
          </div>
          <span className="font-semibold text-base sm:text-lg">Food Stalls</span>
          <p className="text-sm text-gray-400 mt-1">Discover our delicious menu from different food stalls.</p>
        </Link>

        {/* Reviews */}
        <Link href="/reviews" className="group flex flex-col items-center text-gray-200 hover:text-pink-700 transition duration-300 ease-in-out">
          <div className="w-28 h-28 rounded-full bg-neutral-900 border-4 border-pink-600 flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 group-hover:shadow-pink-500/50 transition-transform duration-300">
            <Image 
              src="/images/reviews.png" 
              alt="Reviews" 
              width={64} 
              height={64} 
            />
          </div>
          <span className="font-semibold text-base sm:text-lg">Reviews</span>
          <p className="text-sm text-gray-400 mt-1">Read honest feedback from foodies.</p>
        </Link>

        {/* Promotions */}
        <Link href="/customer/promos" className="group flex flex-col items-center text-gray-200 hover:text-pink-700 transition duration-300 ease-in-out">
          <div className="w-28 h-28 rounded-full bg-neutral-900 border-4 border-pink-600 flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 group-hover:shadow-pink-500/50 transition-transform duration-300">
            <Image 
              src="/images/promotions.png" 
              alt="Promotions" 
              width={64} 
              height={64} 
            />
          </div>
          <span className="font-semibold text-base sm:text-lg">Promotions</span>
          <p className="text-sm text-gray-400 mt-1">Check out the latest food deals.</p>
        </Link>

      </div>
      
    </div>
  );
};

export default FeaturesPage;
