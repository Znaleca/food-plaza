'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/authContext';
import getAllReservations from '@/app/actions/getAllReservations';
import getMySpaces from '@/app/actions/getMySpaces';
import approveBooking from '@/app/actions/approveBooking';
import declineBooking from '@/app/actions/declineBooking';
import ReservationTicket from '@/components/reservationTicket';
import Heading from '@/components/Heading';

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

  return (
    <div className="mt-8 mx-4 md:mx-12">
      <Heading title="Lease Approvals" />
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-lg text-gray-600">No Lease for your food stalls</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.$id}
              className="bg-white shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between"
            >
              <div className="flex-1">
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
