'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import getAllReservations from '@/app/actions/getAllReservations';
import approveBooking from '@/app/actions/approveBooking';
import declineBooking from '@/app/actions/declineBooking';
import ReservationTicket from '@/components/reservationTicket';
const ApprovalPage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const response = await getAllReservations();
      if (response.error) {
        toast.error('Failed to load bookings');
      } else {
        setBookings(response);
      }
    };

    fetchBookings();
  }, []);

  const handleApprove = async (bookingId) => {
    const response = await approveBooking(bookingId);
    if (response.success) {
      toast.success('Booking approved!');
      const updatedBookings = bookings.map((booking) =>
        booking.$id === bookingId ? { ...booking, status: 'approved' } : booking
      );
      setBookings(updatedBookings);
    } else {
      toast.error(response.error);
    }
  };

  const handleDecline = async (bookingId) => {
    const response = await declineBooking(bookingId);
    if (response.success) {
      toast.success('Booking declined!');
      const updatedBookings = bookings.map((booking) =>
        booking.$id === bookingId ? { ...booking, status: 'declined' } : booking
      );
      setBookings(updatedBookings);
    } else {
      toast.error(response.error);
    }
  };

  return (
    <div className="mt-8 mx-4 md:mx-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Approvals</h2>
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-lg text-gray-600">No pending bookings</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.$id}
              className="bg-white shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between"
            >
              <div className="flex-1">
                {/* Use ReservationTicket instead of BookedRoomCard */}
                <ReservationTicket booking={booking} showActions={false} />
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4 sm:mt-0">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(booking.$id)}
                      className="bg-green-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-600 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecline(booking.$id)}
                      className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 transition-all mt-2 sm:mt-0"
                    >
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalPage;
