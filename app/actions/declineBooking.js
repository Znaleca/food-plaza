'use server';
import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { ID } from 'node-appwrite';

async function declineBooking(bookingId) {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    return { error: 'You must be logged in to decline bookings' };
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    // Update the booking status to 'declined'
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        status: 'declined',  // Change status to declined
      }
    );

    return { success: true };
  } catch (error) {
    console.log('Error declining booking:', error);
    return { error: 'Failed to decline the booking' };
  }
}

export default declineBooking;
