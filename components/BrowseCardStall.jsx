'use client';

import Image from "next/image";
import Link from "next/link";
import clsx from 'clsx';

const BrowseCardStall = ({ room }) => {
  const cardClasses = clsx(
    // Sharp corners, heavy 4px border, and a dramatic "lift" shadow on hover
    "group relative flex flex-col bg-white border-4 border-neutral-950 transition-all duration-300 overflow-hidden",
    "cursor-pointer hover:border-red-600"
  );

  return (
    <Link href={`/rooms/${room.id}`} className="block">
      <div className={cardClasses} style={{ minHeight: "340px" }}>
        
        {/* Image Section - No rounded corners, bottom border only */}
        {room.imageUrl ? (
          <div className="relative w-full h-52 overflow-hidden border-b-4 border-neutral-950">
            <Image
              src={room.imageUrl}
              alt={room.name}
              fill
              className="object-cover transition-opacity duration-300"
            />
            {/* Hover overlay label */}
            <div className="absolute top-4 left-4 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Visit Stall
            </div>
          </div>
        ) : (
          <div className="w-full h-52 bg-neutral-100 flex items-center justify-center text-neutral-400 font-black uppercase text-xs border-b-4 border-neutral-950">
            No Image Available
          </div>
        )}

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-6 justify-between bg-white">
          <div>
            <h3 className="text-2xl font-black text-neutral-950 uppercase tracking-tighter leading-none group-hover:text-red-600 transition-colors">
              {room.name}
            </h3>
            
            <div className="mt-4 pt-4 border-t-2 border-neutral-950 flex flex-wrap gap-2">
              {room.type?.length > 0 ? (
                room.type.map((cat, i) => (
                  <span key={i} className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    {cat}{i !== room.type.length - 1 && " •"}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-black uppercase text-neutral-300">Uncategorized</span>
              )}
            </div>
          </div>

          {/* Bottom "CTA" accent */}
          <div className="flex justify-end mt-4">
             <div className="w-8 h-1 bg-red-600 transition-all duration-500 group-hover:w-full" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BrowseCardStall;