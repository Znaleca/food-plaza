'use client';

import { FaUtensils, FaStore, FaStar, FaTag } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';

const features = [
  { id: 'browse', target: 'menu', icon: FaUtensils, title: 'Menu', desc: 'Browse our diverse food options.' },
  { id: 'browse', target: 'stall', icon: FaStore, title: 'Food Stalls', desc: 'Discover menus from different food stalls.' },
  { id: 'reviews', icon: FaStar, title: 'Reviews', desc: 'Read honest feedback from foodies.' },
  { href: '/customer/promos', icon: FaTag, title: 'Promotions', desc: 'Check out the latest food deals.' },
];

const FeaturesSection = () => {
  const [visibleIndexes, setVisibleIndexes] = useState([]);
  const featureRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setVisibleIndexes((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.5 }
    );

    featureRefs.current.forEach((el) => el && observer.observe(el));

    return () => {
      featureRefs.current.forEach((el) => el && observer.unobserve(el));
    };
  }, []);

  const handleScroll = (id, target) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      if (id === 'browse' && target) {
        const url = new URL(window.location.href);
        url.searchParams.set('view', target);
        window.history.replaceState({}, '', url);
        window.dispatchEvent(new Event('popstate'));
      }
    }
  };

  return (
    <section className="w-full min-h-screen bg-neutral-950 text-white py-12 sm:py-20 flex flex-col items-center">
      {/* Header */}
      <header className="text-center mb-28 mt-12 sm:mt-16 px-4">
        <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          Features
        </h2>
        <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
          Explore{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            Food Plaza
          </span>
        </p>
      </header>

      {/* Features Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-6xl w-full px-4 mb-20">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          const isVisible = visibleIndexes.includes(idx);
          const delay = isVisible ? `${idx * 150}ms` : '0ms';

          const content = (
            <div
              ref={(el) => (featureRefs.current[idx] = el)}
              data-index={idx}
              className={`group flex flex-col items-center text-center text-white transition-transform duration-700 transform ${
                isVisible ? 'opacity-100 scale-100 translate-y-0 animate-bounce-smooth' : 'opacity-0 scale-75 translate-y-10'
              }`}
              style={{ transitionDelay: delay }}
            >
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-neutral-900 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-white/30">
                <Icon className="text-white text-3xl sm:text-4xl transition-colors duration-300 group-hover:text-cyan-400" />
              </div>
              <span className="mt-4 sm:mt-6 font-bold text-sm sm:text-lg">{feature.title}</span>
              <p className="text-xs sm:text-sm text-gray-400 font-light mt-1">{feature.desc}</p>
            </div>
          );

          return feature.href ? (
            <a key={feature.title} href={feature.href}>
              {content}
            </a>
          ) : (
            <button key={feature.title} onClick={() => handleScroll(feature.id, feature.target)}>
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
