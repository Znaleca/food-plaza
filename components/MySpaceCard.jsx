import Image from 'next/image';
import Link from 'next/link';
import { FaEye, FaEdit } from 'react-icons/fa';
import DeleteRoomButton from './DeleteRoomButton';

const MySpaceCard = ({ room }) => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const imageUrls = room.images?.map(
    (imageId) =>
      `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
  ) || [];

  const imageSrc = imageUrls.length > 0 ? imageUrls[0] : '/images/no-image.jpg';

  return (
    <div className="relative z-0 bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col transition-all transform hover:scale-105 hover:shadow-2xl border border-yellow-400 w-full sm:w-[400px] md:w-[450px] lg:w-[500px] mx-auto mb-6">
      {/* Image */}
      <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
        <Image
          src={imageSrc}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 ease-in-out hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Details Section */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-extrabold text-blue-400 tracking-wide text-center uppercase">
          {room.name}
        </h3>

        <p className="mt-2 text-center text-gray-500 text-xs sm:text-sm">
          <span className="font-semibold">Type:</span> {room.type?.join(' • ') || 'N/A'}
        </p>
        <p className="text-center text-gray-600 font-medium text-sm">
          <span className="font-semibold">Stall Number:</span> {room.stallNumber || 'N/A'}
        </p>

        <p className="mt-3 text-gray-700 text-center text-sm italic">
          A must-visit spot for delicious bites!
        </p>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-300 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href={`/rooms/${room.$id}/preview`}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full shadow-md text-sm font-semibold flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <FaEye /> View
          </Link>

          <Link
            href={`/rooms/${room.$id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-full shadow-md text-sm font-semibold flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <FaEdit /> Edit
          </Link>

          <DeleteRoomButton roomId={room.$id} />
        </div>
      </div>
    </div>
  );
};

export default MySpaceCard;
