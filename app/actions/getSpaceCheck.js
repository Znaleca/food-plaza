'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite';

async function getSpaceCheck() {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { account, databases } = await createSessionClient(sessionCookie.value);

    // Get user ID
    const user = await account.get();
    const userId = user.$id;

    // Check if at least one room exists for this user
    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.equal('user_id', userId), Query.limit(1)]
    );

    return result.total > 0;
  } catch (error) {
    console.error('Error checking user space:', error);
    return false;
  }
}

export default getSpaceCheck;
