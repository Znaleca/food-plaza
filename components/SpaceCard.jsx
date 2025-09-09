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
    <div className="bg-neutral-900 border border-pink-600 hover:border-pink-500 rounded-3xl overflow-hidden mb-4 transition-colors duration-300 w-full max-w-xs sm:max-w-sm cursor-pointer flex flex-col h-[340px] mx-auto">
      {/* Image */}
      <div className="relative w-full h-40 bg-gray-800">
        <Image
          src={imageSrc}
          alt={room.name}
          fill
          className="object-cover rounded-t-3xl transition duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
        />
      </div>
  
      {/* Card Content */}
      <div className="flex flex-col flex-1 justify-between p-5 text-center">
        <div>
          <div className="w-12 h-0.5 bg-pink-600 group-hover:bg-pink-700 mx-auto mb-4 transition-colors duration-300" />
          <h3 className="text-lg sm:text-xl md:text-xl font-bold text-white uppercase tracking-wide mb-2">
            {room.name}
          </h3>
          <div className="w-12 h-0.5 bg-gray-600 mx-auto mb-4" />
        </div>
  
        {/* Star Rating Preview */}
        <div>
          {reviewCount > 0 ? (
            <RatePreview average={averageRating} count={reviewCount} />
          ) : (
            <p className="text-sm text-gray-400">No reviews</p>
          )}
        </div>
      </div>
    </div>
  </Link>
  
  );
};

export default SpaceCard;
