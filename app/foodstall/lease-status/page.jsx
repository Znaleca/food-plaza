import Heading from '@/components/Heading';
import BookedRoomCard from '@/components/BookedRoomCard';
import getMyBookings from '@/app/actions/getMyBookings';

const BookingsPage = async () => {
  const bookings = await getMyBookings();

  return (
    <>
      <Heading title='My Reservations' />
      {bookings.length === 0 ? (
        <p className='text-gray-600 mt-4'>You have no bookings</p>
      ) : (
        bookings.map((booking) => (
          <BookedRoomCard key={booking.$id} booking={booking} />
        ))
      )}
    </>
  );
};

export default BookingsPage;