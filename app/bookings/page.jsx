import BookedRoomCard from '@/components/BookedRoomCard';
import getMyBookings from '../actions/getMyBookings';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';

const BookingsPage = async () => {
  const bookingsResult = await getMyBookings();
  const bookings = Array.isArray(bookingsResult) ? bookingsResult : [];
  const errorMessage = !Array.isArray(bookingsResult) && bookingsResult?.error
    ? bookingsResult.error
    : null;

  return (
    <div className="min-h-screen bg-white px-2 py-5 text-neutral-950 selection:bg-red-600 selection:text-white md:px-4 md:py-8">
      <div className="w-full">
        <Link
          href="/lease/management"
          className="mb-6 inline-flex items-center border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] transition-all duration-200 hover:translate-y-[2px] hover:bg-black hover:text-white hover:shadow-[2px_2px_0px_#000]"
        >
          <FaChevronLeft className="mr-2" />
          Back
        </Link>

        <section className="border-4 border-black bg-white px-5 py-8 shadow-[10px_10px_0px_#000] md:px-8 md:py-10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-red-600">Lease Module</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black uppercase leading-tight tracking-tight md:text-6xl">My Bookings</h1>
              <p className="mt-3 text-sm font-medium text-neutral-700 md:text-base">
                Track, review, and manage all lease requests in one panel.
              </p>
            </div>
            <div className="inline-flex items-center border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
              {bookings.length} Records
            </div>
          </div>
        </section>
      </div>

      {errorMessage ? (
        <div className="mt-6 border-4 border-black bg-white p-8 text-center shadow-[8px_8px_0px_#000]">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">Unable to load bookings</p>
          <p className="mt-3 text-sm font-medium text-neutral-700">{errorMessage}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-6 border-4 border-black bg-white p-10 text-center shadow-[8px_8px_0px_#000]">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">No Active Lease</p>
          <p className="mt-3 text-sm font-medium text-neutral-700">You do not have any lease bookings yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {bookings.map((booking) => (
            <BookedRoomCard key={booking.$id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;