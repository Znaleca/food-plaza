'use client';

import Image from "next/image";
import Link from "next/link";
import clsx from 'clsx';

const BrowseCardStall = ({ room }) => {
  const cardClasses = clsx(
    "group relative flex flex-col rounded-3xl bg-neutral-900/90 border-2 border-neutral-700 shadow-md hover:border-neutral-500 hover:shadow-lg transition-all duration-300 overflow-hidden",
    "cursor-pointer"
  );

  return (
    <Link href={`/rooms/${room.id}`} passHref>
      <div className={cardClasses} style={{ minHeight: "340px" }}>
        {/* Image Section */}
        {room.imageUrl ? (
          <div className="relative w-full h-48 overflow-hidden rounded-t-[22px]">
            <Image
              src={room.imageUrl}
              alt={room.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-neutral-800 flex items-center justify-center text-gray-400 text-sm rounded-t-[22px]">
            No Image
          </div>
        )}

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-4 justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white truncate">
              {room.name}
            </h3>
            
            {/* Horizontal line and category display */}
            <div className="mt-2 pt-2 border-t border-neutral-700">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-white">Category:</span>{' '}
                {room.type?.join(' • ') || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BrowseCardStall;