'use client';

import Image from 'next/image';
import Link from 'next/link';

const SpaceCard = ({ room }) => {
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
      <div className="bg-neutral-900 border border-pink-600 rounded-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full max-w-sm mx-auto cursor-pointer">
        {/* Image */}
        <div className="relative w-full h-40 bg-gray-800">
          <Image
            src={imageSrc}
            alt={room.name}
            fill
            className="object-cover transition duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Card Content */}
        <div className="p-5 text-center">
          <div className="w-12 h-0.5 bg-pink-600 mx-auto mb-4" />

          <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wide mb-2">
            {room.name}
          </h3>

          <div className="w-12 h-0.5 bg-gray-600 mx-auto mb-4" />

          <p className="text-xs text-gray-400 mb-1">
            <span className="font-semibold text-white">Type:</span>{' '}
            {room.type?.join(' • ') || 'N/A'}
          </p>
            
        </div>
      </div>
    </Link>
  );
};

export default SpaceCard;
