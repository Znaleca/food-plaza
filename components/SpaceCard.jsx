'use client';

import Image from 'next/image';
import Link from 'next/link';
import RatePreview from './RatePreviews';

const SpaceCard = ({ room, priority = false, averageRating = 0, reviewCount = 0, isStallOpen = true }) => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  // Determine if the stall is closed. Default to true (open) if the prop is not passed.
  const isClosed = !isStallOpen;

  const imageUrls =
    room.images?.map(
      (imageId) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
    ) || [];

  const imageSrc = imageUrls.length > 0 ? imageUrls[0] : '/images/no-image.jpg';

  // We wrap the content in an outer div to apply the Link's behavior
  return (
    <Link href={`/rooms/${room.$id}`} passHref>
      <div 
        className={`
          bg-neutral-950 border border-gray-400 rounded-3xl overflow-hidden mb-4
          transition-all duration-300 w-full max-w-xs sm:max-w-sm cursor-pointer flex flex-col
          h-[340px] mx-auto 
          ${isClosed 
            ? 'opacity-60 grayscale cursor-default hover:border-gray-400 hover:scale-100' 
            : 'hover:border-white hover:scale-[1.03]'
          }
        `}
        // Prevent click if closed, though the styling discourages it anyway
        onClick={(e) => isClosed && e.preventDefault()}
      >
        
        {/* Image */}
        <div className="relative w-full h-40 bg-gray-800">
          <Image
            src={imageSrc}
            alt={room.name}
            fill
            className="object-cover rounded-t-3xl transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
          
          {/* --- NEW: Closed Overlay/Badge --- */}
          {isClosed && (
            <div 
              className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"
            >
              <span className="text-white text-2xl font-extrabold tracking-widest bg-red-700 px-4 py-2 rounded shadow-xl">
                CLOSED
              </span>
            </div>
          )}
          {/* --- END NEW --- */}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 justify-between p-5 text-center">
          <div>
            <h3 className="text-lg sm:text-xl md:text-xl font-bold text-white uppercase tracking-wide mb-3">
              {room.name}
            </h3>
            <div className="w-16 h-0.5 bg-gradient-to-r from-pink-500 to-fuchsia-600 mx-auto mb-4" />
          </div>

          {/* Rating */}
          <div>
            {reviewCount > 0 ? (
              <RatePreview average={averageRating} count={reviewCount} />
            ) : (
              <p className="text-sm text-gray-400">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SpaceCard;