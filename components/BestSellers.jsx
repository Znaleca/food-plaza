'use client';

import React from 'react';

const BestSellers = ({ topItems, menuData, setSelectedMenu }) => {
  if (topItems.length === 0) {
    return null;
  }

  // Brutalist Rank Styles
  const rankStyles = [
    "bg-red-600 text-white border-b-4 border-l-4 border-neutral-950", // 1st
    "bg-neutral-950 text-white border-b-4 border-l-4 border-neutral-950", // 2nd
    "bg-white text-neutral-950 border-b-4 border-l-4 border-neutral-950", // 3rd
  ];

  return (
    <div className="mt-16 mb-16 max-w-7xl mx-auto">
      {/* Header with Technical Underline */}
      <div className="mb-12">
        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-neutral-950">
          TOP SELECTIONS
        </h3>
        <div className="flex items-center gap-4 mt-4">
          <div className="h-2 w-24 bg-red-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
            Based on Order Volume
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-4 border-l-4 border-neutral-950">
        {topItems.slice(0, 3).map((item, index) => {
          const found = menuData.find((m) => m.name === item.name);
          if (!found) return null;

          const isAvailable = found.isAvailable ?? true;

          return (
            <div
              key={found.menuId}
              onClick={() => {
                if (!isAvailable) return;
                setSelectedMenu(found);
              }}
              className={`group relative border-r-4 border-b-4 border-neutral-950 flex flex-col overflow-hidden transition-all duration-200 bg-white ${isAvailable
                  ? 'cursor-pointer hover:bg-neutral-950 hover:text-white'
                  : 'opacity-50 grayscale cursor-not-allowed bg-neutral-100'
                }`}
            >
              {/* Rank Badge */}
              <div className={`absolute top-0 right-0 px-5 py-3 font-black text-2xl z-10 ${rankStyles[index]}`}>
                #{index + 1}
              </div>

              {!isAvailable && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-10deg] bg-neutral-950 text-white font-black px-4 py-2 text-xl uppercase tracking-widest z-20 pointer-events-none">
                  SOLD OUT
                </div>
              )}

              {/* Product Image - Edge to edge top */}
              {found.image ? (
                <img
                  src={found.image}
                  alt={found.name}
                  className="w-full aspect-[4/3] object-cover border-b-4 border-neutral-950 group-hover:border-white transition-colors"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-neutral-100 border-b-4 border-neutral-950 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">No Image</span>
                </div>
              )}

              {/* Text Info */}
              <div className="flex flex-col p-6 flex-grow">
                <h4 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-2">
                  {found.name}
                </h4>

                {found.description && (
                  <p className="text-sm font-bold text-neutral-500 mb-8 flex-grow group-hover:text-neutral-300 transition-colors">
                    {found.description}
                  </p>
                )}

                {/* Footer of Card */}
                <div className="flex justify-between items-end mt-auto">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-neutral-500">Orders</span>
                    <p className="text-3xl font-black text-red-600 leading-none mt-1">{item.count}</p>
                  </div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-red-400">
                    SELECT <span className="text-lg leading-none">→</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BestSellers;