import Heading from '@/components/Heading';
import BookingForm from '@/components/BookingForm';
import ReservationsCalendarPage from '@/components/CalendarView';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa';
import getSingleSpace from '@/app/actions/getSingleSpace';
import SpacesImage from '@/components/SpacesImage';
import MapView from '@/components/MapView'; // Import MapView

const RoomSpace = async ({ params }) => {
  const { id } = params;
  const room = await getSingleSpace(id);

  if (!room) {
    return <Heading title="Spaces Not Found" />;
  }

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  // Construct image URLs
  const imageUrls = room.images?.map((imageId) => 
    `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
  ) || [];

  return (
    <>
      <Heading title={room.name} />
      <div className="bg-white shadow-xl rounded-lg p-10 max-w-6xl mx-auto mt-8">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition duration-300"
        >
          <FaChevronLeft className="inline mr-2" />
          <span className="font-medium">Back to Spaces</span>
        </Link>

        <div className="flex flex-col space-y-10">
          {/* Image and Description Section */}
          <div>
            <SpacesImage imageUrls={imageUrls} />
            <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
              <p className="text-gray-800 text-xl font-semibold mb-6">{room.description || 'No description available'}</p>

              <ul className="space-y-6">
                <li className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700 font-semibold text-lg">Type:</span>
                  <span className="text-gray-600 text-lg">{room.type || 'N/A'}</span>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700 font-semibold text-lg">Capacity:</span>
                  <span className="text-gray-600 text-lg">{room.capacity || 'N/A'}</span>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700 font-semibold text-lg">Location:</span>
                  <span className="text-gray-600 text-lg">{room.location || 'N/A'}</span>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700 font-semibold text-lg">Floor:</span>
                  <span className="text-gray-600 text-lg">{room.floor || 'N/A'}</span>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-700 font-semibold text-lg">Room #:</span>
                  <span className="text-gray-600 text-lg">{room.room || 'N/A'}</span>
                </li>
                <li className="flex justify-between items-center py-3">
                  <span className="text-gray-700 font-semibold text-lg">Amenities:</span>
                  <span className="text-gray-600 text-lg">{room.amenities || 'N/A'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* MapView Section */}
          <div className="mt-10 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-center mb-6">Spaces Location</h2>
            <MapView />
          </div>
        </div>

        {/* Booking Form */}
        <div className="mt-10">
          <BookingForm room={room} />
        </div>

        {/* Calendar for the room */}
        <div className="mt-10">
          <ReservationsCalendarPage />
        </div>
      </div>
    </>
  );
};

export default RoomSpace;
