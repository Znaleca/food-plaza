'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { ID } from 'node-appwrite';
import { redirect } from 'next/navigation';
import checkAuth from './checkAuth';
import { revalidatePath } from 'next/cache';
import checkSpaceAvailability from './checkSpaceAvailability';

async function bookSpace(previousState, formData) {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    // Get user's ID
    const { user } = await checkAuth();
    if (!user) {
      return {
        error: 'You must be logged in to book a room',
      };
    }

    // Extract form data
    const checkInDate = formData.get('check_in_date');
    const checkInTime = formData.get('check_in_time');
    const checkOutDate = formData.get('check_out_date');
    const checkOutTime = formData.get('check_out_time');
    const roomId = formData.get('room_id');
    const agenda = formData.get('agenda'); // Extract agenda from form

    // Combine date and time to ISO 8601 format
    const checkInDateTime = `${checkInDate}T${checkInTime}`;
    const checkOutDateTime = `${checkOutDate}T${checkOutTime}`;

    // Check if room is available
    const isAvailable = await checkSpaceAvailability(
      roomId,
      checkInDateTime,
      checkOutDateTime
    );

    if (!isAvailable) {
      return {
        error: 'This room is already booked for the selected time',
      };
    }

    // Prepare booking data
    const bookingData = {
      check_in: checkInDateTime,
      check_out: checkOutDateTime,
      user_id: user.id,
      room_id: roomId,
      agenda: agenda || 'No agenda provided',
      status: 'pending',  // Use a string instead of a boolean
    };
    

    // Create booking
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      ID.unique(),
      bookingData
    );

    // Revalidate cache
    revalidatePath('/bookings', 'layout');

    return {
      success: true,
    };
  } catch (error) {
    console.log('Failed to book room', error);
    return {
      error: 'Something went wrong booking the room',
    };
  }
}

export default bookSpace;
