'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/authContext';
import getAllReservations from '@/app/actions/getAllReservations';
import getMySpaces from '@/app/actions/getMySpaces';
import approveBooking from '@/app/actions/approveBooking';
import declineBooking from '@/app/actions/declineBooking';
import ReservationTicket from '@/components/reservationTicket';

const ApprovalPage = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [myRoomIds, setMyRoomIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myRooms = await getMySpaces(); // rooms created by current user
        const roomIds = myRooms.map((room) => room.$id);
        setMyRoomIds(roomIds);

        const allBookings = await getAllReservations();

        // Filter bookings that belong to the user's own stalls
        const myBookings = allBookings.filter((booking) =>
          roomIds.includes(booking.room_id?.$id || booking.room_id)
        );

        setBookings(myBookings);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (bookingId) => {
    const response = await approveBooking(bookingId);
    if (response.success) {
      toast.success('Booking approved!');
      const updated = bookings.map((b) =>
        b.$id === bookingId ? { ...b, status: 'approved' } : b
      );
      setBookings(updated);
    } else {
      toast.error(response.error);
    }
  };

  const handleDecline = async (bookingId) => {
    const response = await declineBooking(bookingId);
    if (response.success) {
      toast.success('Booking declined!');
      const updated = bookings.map((b) =>
        b.$id === bookingId ? { ...b, status: 'declined' } : b
      );
      setBookings(updated);
    } else {
      toast.error(response.error);
    }
  };

  // Utility: check if booking is expired
  const isExpired = (checkOut) => {
    if (!checkOut) return false;
    return new Date() > new Date(checkOut);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="text-center mb-12 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">MY STALL</h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold">Lease</p>
      </div>

      <div className="space-y-6">
        {bookings.length === 0 ? (
          <p className="text-gray-400 text-center">No Lease for your food stall</p>
        ) : (
          bookings.map((booking) => {
            const expired = isExpired(booking.check_out);

            return (
              <div
                key={booking.$id}
                className="bg-neutral-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between"
              >
                <div className="flex-1">
                  <ReservationTicket booking={booking} showActions={false} />
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4 sm:mt-0">
                  {booking.status === 'pending' && !expired && (
                    <>
                      <button
                        onClick={() => handleApprove(booking.$id)}
                        className="bg-pink-600 text-white px-6 py-3 rounded-lg w-full sm:w-auto text-center shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-gradient-to-r hover:from-yellow-500 hover:to-pink-500 hover:text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(booking.$id)}
                        className="bg-neutral-800 text-white px-6 py-3 rounded-lg w-full sm:w-auto text-center shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-gradient-to-r hover:from-yellow-500 hover:to-pink-500 hover:text-white mt-2 sm:mt-0"
                      >
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApprovalPage;
