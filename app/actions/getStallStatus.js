// getStallStatus.js
'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite'; // Import Query helper

async function getStallStatus(roomId) {
  try {
    const { databases } = await createAdminClient();

    // Fetch the booking status based on room_id
    const { documents: bookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [
        Query.equal('room_id', roomId), // Filter by room_id
      ]
    );

    if (bookings.length > 0) {
      const now = new Date();

      const activeApproved = bookings
        .filter((booking) => {
          if (booking.status !== 'approved') return false;
          if (!booking.check_out) return true;
          return new Date(booking.check_out) > now;
        })
        .sort((current, next) => new Date(next.check_out || 0) - new Date(current.check_out || 0));

      const selectedBooking =
        activeApproved[0] ||
        bookings.sort((current, next) => new Date(next.$createdAt) - new Date(current.$createdAt))[0];

      return {
        roomId,
        status: selectedBooking.status,
        check_out: selectedBooking.check_out || null,
      };
    }

    return null; // Return null if no booking found for the room
  } catch (error) {
    console.log('Failed to get stall status', error);
    return null; // Return null on failure
  }
}

export default getStallStatus;
