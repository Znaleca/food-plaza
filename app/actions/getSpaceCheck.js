'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Query } from 'node-appwrite';

export default async function getSpaceCheck() {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { account, databases } = await createSessionClient(sessionCookie.value);
    const user = await account.get();

    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.equal('user_id', user.$id), Query.limit(1)]
    );

    return result.total > 0; // true if user has at least one space
  } catch (error) {
    console.error('Error checking user space:', error);
    return false;
  }
}
