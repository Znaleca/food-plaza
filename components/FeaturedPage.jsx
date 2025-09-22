'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const FeaturedPage = () => {
  const categories = [
    { name: 'Meals', image: '/images/Meals.png' },
    { name: 'Snacks', image: '/images/Snacks.png' },
    { name: 'Drinks', image: '/images/Drinks.png' },
    { name: 'Dessert', image: '/images/Dessert.png' },
    { name: 'Add-ons', image: '/images/Add-ons.png' },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } },
  };

  return (
    <div className="bg-stone-900 py-12 sm:py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-16 px-4">
          <h2 className="text-base sm:text-lg text-pink-600 font-light tracking-widest">
            CATEGORIES
          </h2>
          <p className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white">
            Find something that suits your crave
          </p>
        </header>

        {/* Category Grid */}
        <div className="flex flex-col items-center gap-8 sm:gap-12">
          {/* Top row (3 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 w-full">
            {categories.slice(0, 3).map((cat) => (
              <motion.div
                key={cat.name}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                exit="exit"
                viewport={{ once: false, amount: 0.3 }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-800 bg-stone-900 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <Link
                  href={`/search?category=${encodeURIComponent(cat.name)}&displayType=Menus`}
                  className="flex flex-col items-center p-6 sm:p-8 text-center"
                >
                  <div className="relative h-24 w-24 sm:h-36 sm:w-36 mb-4">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom row (2 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 w-full max-w-xl sm:max-w-4xl">
            {categories.slice(3).map((cat) => (
              <motion.div
                key={cat.name}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                exit="exit"
                viewport={{ once: false, amount: 0.3 }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-800 bg-stone-900 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <Link
                  href={`/search?category=${encodeURIComponent(cat.name)}&displayType=Menus`}
                  className="flex flex-col items-center p-6 sm:p-8 text-center"
                >
                  <div className="relative h-24 w-24 sm:h-36 sm:w-36 mb-4">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPage;
