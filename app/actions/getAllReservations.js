// --- START OF SERVER ACTION ---

'use server';

import { createAdminClient } from '@/config/appwrite';

async function getAllReservations() {
  try {
    const { databases } = await createAdminClient();

    // Fetch all reservations/bookings
    const { documents: bookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS
    );

    // Attach room/stall details
    const bookingsWithRooms = await Promise.all(
      bookings.map(async (booking) => {
        try {
          if (booking.room_id) {
            // room_id is the ID of the stall/room document
            const room = await databases.getDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
              process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS, // 👈 your rooms collection ID
              booking.room_id
            );
            // Attach the full room document under the 'room' key
            return { ...booking, room };
          }
        } catch (err) {
          console.error(`Error fetching room for booking ID ${booking.$id}:`, err);
        }
        // Return booking with a null room property if not found or an error occurred
        return { ...booking, room: null };
      })
    );

    return bookingsWithRooms;
  } catch (error) {
    console.log('Failed to get reservations', error);
    return {
      error: 'Failed to fetch reservations',
    };
  }
}

export default getAllReservations;