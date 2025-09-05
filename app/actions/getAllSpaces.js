'use server';

import { createSessionClient, createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';

async function getAllSpaces() {
  const sessionCookie = cookies().get('appwrite-session');

  try {
    let databases;

    if (sessionCookie) {
      // ✅ Logged-in user → use their session
      ({ databases } = await createSessionClient(sessionCookie.value));
    } else {
      // ✅ Guest → use admin client (read-only public fetch)
      ({ databases } = await createAdminClient());
    }

    const { documents: rooms } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS
    );

    return rooms;
  } catch (error) {
    console.log('Failed to get rooms', error);
    return [];
  }
}

export default getAllSpaces;
