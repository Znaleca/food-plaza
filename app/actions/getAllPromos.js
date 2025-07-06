'use server';
import { createAdminClient } from '@/config/appwrite';

async function getAllPromos() {
  const { databases } = await createAdminClient();
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching promos:', error);
    return [];
  }
}

export default getAllPromos;
