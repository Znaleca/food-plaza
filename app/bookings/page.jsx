import BookedRoomCard from '@/components/BookedRoomCard';
import getMyBookings from '../actions/getMyBookings';

const BookingsPage = async () => {
  const bookings = await getMyBookings();

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
 <div className="text-center mb-12 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">ALL STALL</h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white">Lease</p>
      </div>
      {bookings.length === 0 ? (
        <p className="text-gray-400 mt-4">You have no bookings</p>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookedRoomCard key={booking.$id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
