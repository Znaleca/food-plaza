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
    <Link href={`/lease/${room.$id}`}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl hover:scale-105 transition-all duration-300 w-full max-w-4xl mx-auto cursor-pointer">
        {/* Cinema Format Container: Horizontal Layout */}
        <div className="flex items-center space-x-6">
          {/* Circular Image */}
          <div className="relative w-28 h-28 bg-gray-800 rounded-full overflow-hidden">
            <Image
              src={imageSrc}
              alt={room.name}
              layout="fill"
              className="object-cover transition duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Card Content */}
          <div className="flex flex-col justify-between w-3/5">
            <div className="text-center">
              <div className="w-11 h-0.5 bg-yellow-400 mx-auto mb-4" />

              {/* Room Name */}
              <h3 className="text-xl sm:text-2xl font-semibold text-white uppercase tracking-wide mb-2">
                {room.name || 'No Name'}
              </h3>

              {/* Stall Number in Circle */}
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold">{room.stallNumber || 'N/A'}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LeaseCard;
