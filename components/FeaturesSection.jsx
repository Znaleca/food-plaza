'use client';

import Image from 'next/image';

const features = [
  {
    id: 'browse',
    target: 'menu',
    img: '/images/menu.png',
    title: 'Menu',
    desc: 'Browse our diverse food options.',
  },
  {
    id: 'browse',
    target: 'stall',
    img: '/images/stall.png',
    title: 'Food Stalls',
    desc: 'Discover menus from different food stalls.',
  },
  {
    id: 'reviews',
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
  const handleScroll = (id, target) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });

      if (id === 'browse' && target) {
        const url = new URL(window.location.href);
        url.searchParams.set('view', target); // updates query param
        window.history.replaceState({}, '', url);
        // dispatch event so BrowsePreview reacts immediately
        window.dispatchEvent(new Event('popstate'));
      }
    }
  };

  return (
<section className="w-full min-h-screen bg-neutral-900 text-white py-12 sm:py-20 flex flex-col items-center -mb-20 sm:-mb-80">
{/* Header */}
      <header className="text-center mb-12 sm:mb-16 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">
          FEATURES
        </h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold leading-tight">
          Explore Food Plaza
        </p>
      </header>

      {/* Features Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-5xl w-full px-4">
        {features.map((feature) =>
          feature.href ? (
            <a
              key={feature.title}
              href={feature.href}
              className="group flex flex-col items-center text-center text-gray-200 hover:text-white transition-colors duration-300"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-transparent bg-gradient-to-r from-pink-600 to-fuchsia-600 p-[2px] shadow-lg group-hover:scale-105 transition-transform duration-300">
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
              <span className="mt-3 sm:mt-4 font-semibold text-sm sm:text-lg">{feature.title}</span>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">{feature.desc}</p>
            </a>
          ) : (
            <button
              key={feature.title}
              onClick={() => handleScroll(feature.id, feature.target)}
              className="group flex flex-col items-center text-center text-gray-200 hover:text-white transition-colors duration-300"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-transparent bg-gradient-to-r from-pink-600 to-fuchsia-600 p-[2px] shadow-lg group-hover:scale-105 transition-transform duration-300">
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
              <span className="mt-3 sm:mt-4 font-semibold text-sm sm:text-lg">{feature.title}</span>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">{feature.desc}</p>
            </button>
          )
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;
