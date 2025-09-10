'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/authContext';
import getAllReservations from '@/app/actions/getAllReservations';
import getMySpaces from '@/app/actions/getMySpaces';
import approveBooking from '@/app/actions/approveBooking';
import declineBooking from '@/app/actions/declineBooking';
import ReservationTicket from '@/components/reservationTicket';
import PreviewFile from '@/components/PreviewFile';
import UploadContract from '@/components/UploadContract';
import { FaFilePdf, FaEyeSlash, FaTriangleExclamation } from 'react-icons/fa6';

const ApprovalPage = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [myRoomIds, setMyRoomIds] = useState([]);
  const [openPreview, setOpenPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const myRooms = await getMySpaces();
        const roomIds = myRooms.map((room) => room.$id);
        setMyRoomIds(roomIds);

        const allBookings = await getAllReservations();

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
      toast.success('Lease approved!');
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
      toast.success('Lease declined!');
      const updated = bookings.map((b) =>
        b.$id === bookingId ? { ...b, status: 'declined' } : b
      );
      setBookings(updated);
    } else {
      toast.error(response.error);
    }
  };

  const handleContractUploaded = (bookingId, fileId, fileType) => {
    const updated = bookings.map((b) =>
      b.$id === bookingId ? { ...b, pdf_attachment: fileId, file_type: fileType } : b
    );
    setBookings(updated);
  };

  const isExpired = (checkOut) => {
    if (!checkOut) return false;
    return new Date() > new Date(checkOut);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="text-center mb-12 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">
          MY STALL
        </h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold">Lease</p>
      </div>

      <div className="space-y-6">
        {bookings.length === 0 ? (
          <p className="text-gray-400 text-center">
            No Lease for your food stall
          </p>
        ) : (
          bookings.map((booking) => {
            const expired = isExpired(booking.check_out);
            const isOpen = openPreview === booking.$id;

            return (
              <div
                key={booking.$id}
                className="bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-700"
              >
                {/* Reservation Ticket */}
                <ReservationTicket booking={booking} showActions={false} />

                {/* ✅ Contract Section */}
                <div className="mt-4 space-y-3">
                  {booking.pdf_attachment ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenPreview(isOpen ? null : booking.$id)
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 text-sm font-medium text-white shadow-md hover:bg-pink-600 transition"
                      >
                        {isOpen ? (
                          <>
                            <FaEyeSlash className="text-gray-200" />
                            Hide Contract
                          </>
                        ) : (
                          <>
                            <FaFilePdf className="text-red-500" />
                            Show Contract
                          </>
                        )}
                      </button>

                      {isOpen && (
                        <div className="mt-3 border border-neutral-600 rounded-lg p-3 bg-neutral-900 shadow-inner">
                          <PreviewFile
                            bookingId={booking.$id}
                            fileId={booking.pdf_attachment}
                            fileType={booking.file_type}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-900/30 border border-yellow-700 px-3 py-2 rounded-md">
                      <FaTriangleExclamation /> You need to upload the contract before approving.
                    </p>
                  )}

                  {/* ✅ Upload only visible if still pending */}
                  {booking.status === 'pending' && (
                    <UploadContract
                      bookingId={booking.$id}
                      onUploaded={(fileId, fileType) =>
                        handleContractUploaded(booking.$id, fileId, fileType)
                      }
                    />
                  )}
                </div>

                {/* ✅ Action Buttons below contract */}
                {booking.status === 'pending' && !expired && (
                  <div className="flex flex-col sm:flex-row sm:space-x-4 mt-6 justify-end">
                    <button
                      onClick={() => handleApprove(booking.$id)}
                      disabled={!booking.pdf_attachment}
                      className={`px-6 py-3 rounded-lg w-full sm:w-auto text-center shadow-md transition-all duration-200 ease-in-out transform
                        ${
                          booking.pdf_attachment
                            ? 'bg-pink-600 text-white hover:scale-[1.02] hover:bg-gradient-to-r hover:from-yellow-500 hover:to-pink-500'
                            : 'bg-neutral-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleDecline(booking.$id)}
                      className="bg-neutral-700 text-white px-6 py-3 rounded-lg w-full sm:w-auto text-center shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-gradient-to-r hover:from-yellow-500 hover:to-pink-500 hover:text-white mt-2 sm:mt-0"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ApprovalPage;
