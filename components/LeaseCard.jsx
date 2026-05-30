'use client';

import Image from 'next/image';
import Link from 'next/link';

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
      <div className="h-full cursor-pointer border-4 border-black bg-white p-5 shadow-[8px_8px_0px_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] md:p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden border-2 border-black bg-neutral-200 md:h-28 md:w-28">
            <Image
              src={imageSrc}
              alt={room.name}
              layout="fill"
              className="object-cover transition duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600">Lease Stall</p>
            <h3 className="mt-2 line-clamp-2 text-lg font-black uppercase tracking-tight text-neutral-950 sm:text-xl">
              {room.name || 'No Name'}
            </h3>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="border-2 border-black bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                Stall #{room.stallNumber || 'N/A'}
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-700">Open</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LeaseCard;
