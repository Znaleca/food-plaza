'use client';

import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    href: '/?view=menu',
    img: '/images/menu.png',
    title: 'Menu',
    desc: 'Browse our diverse food options.',
  },
  {
    href: '/?view=stall',
    img: '/images/stall.png',
    title: 'Food Stalls',
    desc: 'Discover menus from different food stalls.',
  },
  {
    href: '/reviews',
    img: '/images/reviews.png',
    title: 'Reviews',
    desc: 'Read honest feedback from foodies.',
  },
  {
    href: '/customer/promos',
    img: '/images/promotions.png',
    title: 'Promotions',
    desc: 'Check out the latest food deals.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="w-full min-h-screen bg-neutral-900 text-white py-20 flex flex-col items-center">
      {/* Header */}
      <header className="text-center mb-16 px-4">
        <h2 className="text-lg sm:text-1xl text-pink-600 font-light tracking-widest">
          FEATURES
        </h2>
        <p className="mt-4 text-3xl sm:text-5xl font-extrabold leading-tight">
          Explore Food Plaza
        </p>
      </header>

      {/* Features Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-5xl w-full px-4">
        {features.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="group flex flex-col items-center text-center text-gray-200 hover:text-white transition-colors duration-300"
          >
            <div className="w-28 h-28 rounded-full border-2 border-transparent bg-gradient-to-r from-pink-600 to-fuchsia-600 p-[2px] shadow-lg group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  width={56}
                  height={56}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
            <span className="mt-4 font-semibold text-base sm:text-lg">{feature.title}</span>
            <p className="text-sm text-gray-400 mt-1">{feature.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
