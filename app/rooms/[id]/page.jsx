import Heading from '@/components/Heading';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa';
import getSingleSpace from '@/app/actions/getSingleSpace';
import SpacesImage from '@/components/SpacesImage';

const RoomSpace = async ({ params }) => {
  const { id } = params;
  const room = await getSingleSpace(id);

  if (!room) {
    return <Heading title="Food Stall Not Found" />;
  }

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  // Construct image URLs
  const imageUrls =
    room.images?.map(
      (imageId) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
    ) || [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back Button */}
      <Link
        href="/"
        className="flex items-center text-blue-500 hover:text-blue-700 transition-transform duration-300 transform hover:scale-105 mb-8"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back to Food Stalls</span>
      </Link>

      {/* Stall Name */}
      <Heading 
        title={room.name} 
        className="text-center text-4xl font-extrabold text-gray-900 
          bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 
          bg-clip-text text-transparent"
      />

      {/* Food Stall Details */}
      <div className="bg-white shadow-2xl rounded-2xl p-8 mt-8 border border-gray-200">
        {/* Images */}
        <div className="mb-8">
          <SpacesImage imageUrls={imageUrls} />
        </div>

        {/* Food Stall Info */}
        <div className="bg-green-950 text-white p-6 rounded-2xl shadow-lg text-center mb-8">
          <h2 className="text-3xl font-bold">{room.name}</h2>
          <p className="text-lg mt-2 italic">{room.description || 'Delicious food available here!'}</p>
        </div>

        {/* Grid for Stall Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800">
          {/* Stall Number */}
          <div className="p-6 border border-gray-300 rounded-2xl shadow-md bg-gray-100 text-center">
            <span className="text-gray-700 font-semibold text-lg">Stall Number:</span>
            <p className="text-2xl font-bold mt-1">{room.stallNumber || 'N/A'}</p>
          </div>

          {/* Food Type */}
          <div className="p-6 border border-gray-300 rounded-2xl shadow-md bg-gray-100 text-center">
            <span className="text-gray-700 font-semibold text-lg">Type</span>
            <p className="text-clip font-normal mt-1">{room.type?.join(' • ') || 'N/A'}</p>
          </div>
        </div>

        {/* Menu Section */}
        <div className="mt-10 p-8 border border-gray-300 rounded-2xl shadow-lg bg-gray-100">
          <h3 className="text-3xl font-semibold text-yellow-500 mb-6 text-center">Menu</h3>
          {Array.isArray(room.menuName) && Array.isArray(room.menuPrice) && room.menuName.length > 0 ? (
            <ul className="divide-y divide-gray-300">
              {room.menuName.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-4 text-gray-700 text-lg font-medium">
                  <span>{item}</span>
                  <span className="font-bold text-green-900 text-xl">
                    ₱{room.menuPrice[index] !== undefined ? room.menuPrice[index].toFixed(2) : 'N/A'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-lg text-center">Menu not available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomSpace;
