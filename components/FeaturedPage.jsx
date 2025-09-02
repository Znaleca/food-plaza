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
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } },
  };

  return (
    <div className="bg-neutral-900 py-16 sm:py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-20 px-4">
          <h2 className="text-sm sm:text-xl text-pink-600 font-light tracking-widest uppercase">
            Categories
          </h2>
          <p className="mt-4 text-2xl sm:text-4xl lg:text-6xl font-extrabold leading-tight text-white">
            Explore what you crave
          </p>
        </header>

        {/* Category Grid */}
        <div className="flex flex-col items-center gap-10 sm:gap-14">
          {/* Top row (3 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12 w-full">
            {categories.slice(0, 3).map((cat) => (
              <motion.div
                key={cat.name}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                exit="exit"
                viewport={{ once: false, amount: 0.3 }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <Link
                  href={`/search?category=${encodeURIComponent(cat.name)}&displayType=Menus`}
                  className="block p-4 sm:p-5"
                >
                  <div className="flex items-center sm:space-x-8 flex-col sm:flex-row text-center sm:text-left">
                    <div className="relative h-28 w-28 sm:h-44 sm:w-44 flex-shrink-0">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain transition-transform duration-300"
                      />
                    </div>
                    <h3 className="mt-4 sm:mt-0 text-lg sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-pink-400 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom row (2 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 w-full max-w-2xl sm:max-w-4xl">
            {categories.slice(3).map((cat) => (
              <motion.div
                key={cat.name}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                exit="exit"
                viewport={{ once: false, amount: 0.3 }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <Link
                  href={`/search?category=${encodeURIComponent(cat.name)}&displayType=Menus`}
                  className="block p-6 sm:p-10"
                >
                  <div className="flex items-center sm:space-x-8 flex-col sm:flex-row text-center sm:text-left">
                    <div className="relative h-28 w-28 sm:h-44 sm:w-44 flex-shrink-0">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-contain transition-transform duration-300"
                      />
                    </div>
                    <h3 className="mt-4 sm:mt-0 text-lg sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-pink-400 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
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
