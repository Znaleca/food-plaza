'use client';

import Image from 'next/image';
import Link from 'next/link';
import RatePreview from './RatePreviews';

const SpaceCard = ({ room, priority = false, averageRating = 0, reviewCount = 0 }) => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const imageUrls =
    room.images?.map(
      (imageId) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
    ) || [];

  const imageSrc = imageUrls.length > 0 ? imageUrls[0] : '/images/no-image.jpg';

  return (
    <Link href={`/rooms/${room.$id}`} passHref>
      <div className="bg-neutral-950 border border-gray-400 rounded-3xl overflow-hidden mb-4
                transition-all duration-300 w-full max-w-xs sm:max-w-sm cursor-pointer flex flex-col
                h-[340px] mx-auto hover:border-white hover:scale-[1.03]">

        
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
