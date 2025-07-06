'use server';

import { createAdminClient } from '@/config/appwrite';

async function getDetailedPromos() {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS
    );

    return response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title,
      description: doc.description,
      discount: doc.discount,
    }));
  } catch (error) {
    console.error('Error fetching detailed promos:', error);
    return [];
  }
}

export default getDetailedPromos;
