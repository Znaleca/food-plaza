'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite'; // Import the Query helper from Appwrite

async function getMySpaces() {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { account, databases } = await createSessionClient(sessionCookie.value);

    // Get user's ID
    const user = await account.get();
    const userId = user.$id;

    // Fetch user's rooms only
    const { documents: rooms } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [
        Query.equal('user_id', userId), // Filter by the field where you stored creator ID
      ]
    );

    return rooms;
  } catch (error) {
    console.log('Failed to get user rooms', error);
    redirect('/error');
  }
}

export default getMySpaces;
