"use server";

import { createSessionClient } from '@/config/appwrite';
import getSessionCookie from './getSessionCookie';
import { Query } from 'node-appwrite';
import { redirect } from 'next/navigation';
import checkAuth from './checkAuth';

/**
 * Fetches all leases (bookings) for the currently authenticated user.
 */
async function getLeaseInfo() {
  const sessionCookie = await getSessionCookie();
  if (!sessionCookie) redirect('/login');

  try {
    const { databases } = await createSessionClient(sessionCookie.value);
    const { user } = await checkAuth();
    if (!user) return { error: 'You must be logged in to view leases' };

    const { documents: leases } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      [Query.equal('user_id', user.id)]
    );

    return leases;
  } catch (error) {
    console.error('Failed to get user leases', error);
    return { error: 'Failed to get leases. Please try again later.' };
  }
}

export default getLeaseInfo;