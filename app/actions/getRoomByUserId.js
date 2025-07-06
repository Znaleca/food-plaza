'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

async function getRoomByUserId(userId) {
  if (!userId) return null;

  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.equal('user_id', userId)]
    );

    // If multiple rooms, return the first match
    return response.documents?.[0] || null;
  } catch (err) {
    console.error('Error fetching room by userId:', err);
    return null;
  }
}

export default getRoomByUserId;
