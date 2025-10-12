'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { Query } from 'node-appwrite';
import { redirect } from 'next/navigation';
import checkAuth from './checkAuth';

/**
 * Fetches all leases (bookings) for the currently authenticated user.
 * It only returns the raw lease documents, without fetching room details.
 * @returns {Promise<Array<Object> | { error: string }>} An array of lease objects, 
 * or an error object.
 */
async function getLeaseInfo() {
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

    // Fetch user's leases
    // NOTE: We are using the BOOKINGS collection as per the original file.
    const { documents: leases } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [Query.equal('user_id', user.$id)] // Assuming user.$id is the correct property for user ID
    );

    // Return the lease documents directly, without fetching room details
    return leases;

  } catch (error) {
    console.log('Failed to get user leases', error);
    return { error: 'Failed to get leases. Please try again later.' };
  }
}

export default getLeaseInfo;