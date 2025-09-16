import BookedRoomCard from '@/components/BookedRoomCard';
import getMyBookings from '../actions/getMyBookings';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';

const BookingsPage = async () => {
  const bookings = await getMyBookings();

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      {/* Back Button */}
      <Link
        href="/lease/management"
        className="flex items-center text-yellow-400 hover:text-pink-400 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      {/* Header Section */}
      <div className="text-center mb-12 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">ALL STALL</h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white">Lease</p>
      </div>

      {/* Display No Bookings Message or Card Grid */}
      {bookings.length === 0 ? (
        <p className="text-gray-400 mt-4 text-center">You have no lease</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <BookedRoomCard key={booking.$id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;