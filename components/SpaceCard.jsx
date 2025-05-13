import Image from 'next/image';
import Link from 'next/link';

const SpaceCard = ({ room }) => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  // Construct image URLs
  const imageUrls = room.images?.map(
    (imageId) =>
      `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
  ) || [];

  const imageSrc = imageUrls.length > 0 ? imageUrls[0] : '/images/no-image.jpg';

  return (
    <div className="relative z-0 bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col transition-all transform hover:scale-105 hover:shadow-2xl border border-pink-600 w-full sm:w-[400px] md:w-[450px] lg:w-[500px] mx-auto mb-6">
      {/* Food Stall Image */}
      <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
  <Image
    src={imageSrc}
    alt={room.name}
    fill
    className="object-cover transition-transform duration-500 ease-in-out"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>


      {/* Details Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Food Stall Name */}
        <h3 className="text-2xl font-extrabold text-pink-600 tracking-wide text-center uppercase">
          {room.name}
        </h3>

        {/* Stall Type & Stall Number */}
        <p className="mt-2 text-center text-gray-500 text-xs sm:text-sm">
          <span className="font-semibold">Type:</span> {room.type?.join(' • ') || 'N/A'}
        </p>
        <p className="text-center text-gray-600 font-medium text-sm">
          <span className="font-semibold">Stall Number:</span> {room.stallNumber || 'N/A'}
        </p>

        {/* Description */}
        <p className="mt-3 text-gray-700 text-center text-sm italic">
        "Your next great meal starts at The Corner."
        </p>

        {/* Call-to-Action */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <Link
            href={`/rooms/${room.$id}`}
            className="block text-center bg-black text-white py-3 px-6 rounded-full shadow-md text-lg font-semibold tracking-wide transition-all hover:bg-gray-900 hover:shadow-lg transform hover:scale-105"
          >
            Order Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;