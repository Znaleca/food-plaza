'use server';
import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';

async function approveBooking(bookingId) {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    return { error: 'You must be logged in to approve bookings' };
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    // Update the booking status to 'approved'
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        status: 'approved',  
      }
    );

    return { success: true };
  } catch (error) {
    console.log('Error approving booking:', error);
    return { error: 'Failed to approve the booking' };
  }
}

export default approveBooking;
