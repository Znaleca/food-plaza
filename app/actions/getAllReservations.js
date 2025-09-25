'use server';

import { createAdminClient } from '@/config/appwrite';

async function getAllReservations() {
  try {
    const { databases } = await createAdminClient();

    // Fetch all reservations
    const { documents: bookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS
    );

    // Attach room details
    const bookingsWithRooms = await Promise.all(
      bookings.map(async (booking) => {
        try {
          if (booking.room_id) {
            const room = await databases.getDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
              process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS, // 👈 your rooms collection ID
              booking.room_id
            );
            return { ...booking, room };
          }
        } catch (err) {
          console.error('Error fetching room:', err);
        }
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
