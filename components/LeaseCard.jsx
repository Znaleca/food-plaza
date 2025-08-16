'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaEye } from 'react-icons/fa';

const LeaseCard = ({ room }) => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const imageUrls =
    room.images?.map(
      (imageId) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
    ) || [];

  const imageSrc = imageUrls.length > 0 ? imageUrls[0] : '/images/no-image.jpg';

  return (
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

        {/* Stall Number in Circle */}
        <div className="relative mb-4">
          <div className="w-16 h-16 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto">
            <span className="text-xl font-bold">{room.stallNumber || 'N/A'}</span>
          </div>
        </div>

        {/* Room Name */}
        <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wide mb-2">
          {room.name || 'No Name'}
        </h3>

        <div className="w-12 h-0.5 bg-gray-600 mx-auto mb-4" />

        {/* Action Button */}
        <div className="mt-6">
          <Link
            href={`/lease/${room.$id}`}
            className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3 px-6 rounded-full shadow-lg font-semibold transform transition-all hover:from-pink-700 hover:to-pink-800 hover:scale-105"
          >
            <FaEye className="inline-block mr-2" /> <span className="text-sm">View Lease</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LeaseCard;
