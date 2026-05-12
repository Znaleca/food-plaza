'use client';

import Image from 'next/image';
import Link from 'next/link';
import RatePreview from './RatePreviews';

const SpaceCard = ({ room, priority = false, averageRating = 0, reviewCount = 0, isStallOpen = true }) => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const isClosed = !isStallOpen;

  const imageUrls =
    room.images?.map(
      (imageId) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
    ) || [];

  const imageSrc = imageUrls.length > 0 ? imageUrls[0] : '/images/no-image.jpg';

  return (
    <Link href={`/rooms/${room.$id}`} passHref className={isClosed ? 'pointer-events-none' : ''}>
      <div 
        className={`
          bg-white border-4 border-neutral-950 overflow-hidden
          transition-transform duration-300 ease-out w-full cursor-pointer flex flex-col
          h-[420px] group relative origin-center
          ${isClosed 
            ? 'grayscale opacity-70' 
            : 'hover:bg-neutral-950 hover:scale-[1.03] active:scale-[0.98]'
          }
        `}
      >
        {/* Image Container */}
        <div className="relative w-full h-48 border-b-4 border-neutral-950 bg-neutral-100 overflow-hidden">
          <Image
            src={imageSrc}
            alt={room.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
          
          {isClosed && (
            <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center z-10 p-4">
              <span className="text-white text-xl font-black tracking-tighter bg-red-600 px-4 py-2 border-2 border-white uppercase transform -rotate-3">
                NOT OPEN
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 justify-between p-6 transition-colors duration-300">
          <div className="text-left">
            <h3 className={`text-xl font-black uppercase tracking-tighter leading-none transition-colors duration-300 ${isClosed ? 'text-neutral-950' : 'group-hover:text-white'}`}>
              {room.name}
            </h3>
            <div className={`h-1.5 w-12 mt-3 transition-colors duration-300 ${isClosed ? 'bg-red-600' : 'bg-red-600 group-hover:bg-white'}`} />
          </div>

          <div className={`transition-colors duration-300 ${isClosed ? 'text-neutral-500' : 'group-hover:text-neutral-400'}`}>
            {reviewCount > 0 ? (
              <RatePreview average={averageRating} count={reviewCount} />
            ) : (
              <p className="text-xs font-bold uppercase tracking-widest">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SpaceCard;