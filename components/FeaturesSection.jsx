'use client';

import { FaUtensils, FaStore, FaStar, FaPercent } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

// Adjust this import path based on your exact Next.js alias setup
import logo from '@/assets/images/logo.svg'; 

const features = [
  { id: 'browse', target: 'menu', icon: FaUtensils, title: 'The Menu', desc: 'Browse every dish available in the court.' },
  { id: 'browse', target: 'stall', icon: FaStore, title: 'The Stalls', desc: 'Find your favorite vendor or discover new ones.' },
  { id: 'reviews', icon: FaStar, title: 'The Vibe', desc: 'Check ratings and real photos from fellow diners.' },
  { href: '/customer/promos', icon: FaPercent, title: 'The Deals', desc: 'Exclusive foodcourt discounts and daily specials.' },
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
      { threshold: 0.1 }
    );

    featureRefs.current.forEach((el) => el && observer.observe(el));
    return () => featureRefs.current.forEach((el) => el && observer.unobserve(el));
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
    <section className="w-full bg-white text-neutral-950 font-sans selection:bg-red-600 selection:text-white border-b-[8px] border-neutral-950">
      {/* Header Section: Foodcourt Directory Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-t-[8px] border-neutral-950">
        <header className="lg:col-span-8 p-8 md:p-16 lg:p-20 border-b-4 lg:border-b-0 lg:border-r-4 border-neutral-950">
          <div className="text-xs font-black tracking-[0.4em] uppercase mb-8 text-red-600">
            [ Digital Directory ]
          </div>
          
          {/* BLITZ FOODCOURT Scaled Design */}
          <div className="flex items-center cursor-default group mb-10">
            <Image 
              src={logo} 
              alt="Blitz Logo" 
              className="h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 object-contain invert transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" 
              priority 
            />
            <div className="ml-4 md:ml-6 flex flex-col justify-center transition-transform duration-300 group-hover:translate-x-2">
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-neutral-950 tracking-tighter uppercase leading-[0.85]">
                BLITZ
              </h2>
              <span className="text-lg md:text-2xl lg:text-3xl font-black text-white bg-red-600 px-3 py-1.5 md:px-4 md:py-2 mt-2 tracking-[0.2em] uppercase leading-none border-[3px] border-neutral-950 shadow-[6px_6px_0px_#0a0a0a] w-max group-hover:bg-neutral-950 group-hover:shadow-[6px_6px_0px_#dc2626] transition-all duration-300">
                FOODCOURT
              </span>
            </div>
          </div>

          <p className="max-w-md text-lg font-bold uppercase tracking-tight leading-tight">
            One floor. Infinite flavors. Navigate your hunger with our complete stall directory.
          </p>
        </header>
        
        <div className="lg:col-span-4 flex flex-col justify-end bg-red-600 text-white p-8 md:p-16">
          <div className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
            EAT <br/> NOW.
          </div>
        </div>
      </div>

      {/* Feature Grid: Flat and Brutal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t-4 border-neutral-950">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          const isVisible = visibleIndexes.includes(idx);

          const content = (
            <div
              ref={(el) => (featureRefs.current[idx] = el)}
              data-index={idx}
              className={`group relative flex flex-col h-full p-10 transition-all duration-300 bg-white 
                ${idx !== features.length - 1 ? 'border-b-4 lg:border-b-0 lg:border-r-4 border-neutral-950' : 'border-b-4 lg:border-b-0'}
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              {/* Solid Color Swap on Hover */}
              <div className="absolute inset-0 bg-neutral-950 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

              <div className="relative z-10 flex flex-col h-full group-hover:text-white transition-colors duration-150">
                <div className="mb-10">
                   <Icon className="text-5xl group-hover:text-red-500 transition-colors" />
                </div>
                
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">
                  {feature.title}
                </h3>
                
                <p className="text-sm font-bold leading-snug uppercase opacity-70 group-hover:opacity-100">
                  {feature.desc}
                </p>

                <div className="mt-auto pt-16 flex items-center justify-between border-t-2 border-transparent group-hover:border-red-500 transition-colors">
                  <span className="text-xs font-black tracking-widest uppercase">Go to section</span>
                  <span className="text-3xl font-light">→</span>
                </div>
              </div>
            </div>
          );

          return feature.href ? (
            <a key={feature.title} href={feature.href} className="h-full">
              {content}
            </a>
          ) : (
            <button key={feature.title} onClick={() => handleScroll(feature.id, feature.target)} className="h-full text-left">
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;