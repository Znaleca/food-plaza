//All Reservations

'use server';

import { createAdminClient } from '@/config/appwrite';

async function getAllReservations() {
  try {
    const { databases } = await createAdminClient();

    // Fetch all reservations from the bookings collection
    const { documents: rooms } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS
    );

    return rooms;
  } catch (error) {
    console.log('Failed to get reservations', error);
    return {
      error: 'Failed to fetch reservations',
    };
  }
}

export default getAllReservations;
