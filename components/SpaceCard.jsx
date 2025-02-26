import Image from 'next/image';
import Link from 'next/link';

const SpaceCard = ({ room }) => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  // Construct image URLs
  const imageUrls = room.images?.map((imageId) =>
    `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
  ) || [];

  const imageSrc = imageUrls.length > 0 ? imageUrls[0] : '/images/no-image.jpg';

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col transition-transform transform hover:scale-105 hover:shadow-2xl hover:bg-gray-50">
      <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
        <Image
          src={imageSrc}
          alt={room.name}
          fill
          style={{ objectFit: 'cover' }} // Replaces the deprecated objectFit
          className="transform transition-transform duration-500 ease-in-out hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw" // Adjust for different screen sizes
        />
      </div>
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-all duration-300">{room.name}</h3>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-semibold text-gray-900">Type:</span> {room.type}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-semibold text-gray-900">Location:</span> {room.location}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-semibold text-gray-900">Capacity:</span> {room.capacity}
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link
            href={`/rooms/${room.$id}`}
            className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-8 rounded-lg text-center w-full transition-all hover:from-blue-900 hover:to-slate-500 transform hover:scale-105"
          >
            View Space
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;
