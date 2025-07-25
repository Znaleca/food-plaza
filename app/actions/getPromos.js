'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

async function getPromos(userId) {
  const { databases } = await createAdminClient();

  if (!userId) return [];

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
      [Query.equal('user_id', userId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching promos:', error);
    return [];
  }
}

export default getPromos;
