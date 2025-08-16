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
      // Get the status and return it along with the room_id
      const status = bookings[0].status;
      return { roomId: roomId, status }; // Return both roomId and status
    }

    return null; // Return null if no booking found for the room
  } catch (error) {
    console.log('Failed to get stall status', error);
    return null; // Return null on failure
  }
}

export default getStallStatus;
