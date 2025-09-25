'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { Query } from 'node-appwrite';
import { redirect } from 'next/navigation';
import checkAuth from './checkAuth';

async function getMyBookings() {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);

    // Get user's ID
    const { user } = await checkAuth();
    if (!user) {
      return { error: 'You must be logged in to view leases' };
    }

    // Fetch user's bookings
    const { documents: bookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [Query.equal('user_id', user.id)]
    );

    // Fetch room details for each booking
    const bookingsWithRooms = await Promise.all(
      bookings.map(async (booking) => {
        try {
          if (booking.room_id) {
            const room = await databases.getDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
              process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS, // 👈 your rooms collection
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
    console.log('Failed to get user lease', error);
    return { error: 'Failed to get leases. Please try again later.' };
  }
}

export default getMyBookings;
