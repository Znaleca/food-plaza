"use server";

import { createSessionClient } from '@/config/appwrite';
import getSessionCookie from './getSessionCookie';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import checkAuth from './checkAuth';

async function deleteBooking(bookingId) {
  const sessionCookie = await getSessionCookie();
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    const { user } = await checkAuth();

    if (!user) {
      return {
        error: 'You must be logged in to delete a booking',
      };
    }

    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    if (booking.user_id !== user.id) {
      return {
        error: 'You are not authorized to delete this booking',
      };
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    revalidatePath('/bookings', 'layout');

    return {
      success: true,
    };
  } catch (error) {
    console.log('Failed to delete booking', error);
    return {
      error: 'Failed to delete booking',
    };
  }
}

export default deleteBooking;
