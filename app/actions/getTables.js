'use server';

import { createAdminClient } from '@/config/appwrite';

async function getTables() {
  const { databases } = await createAdminClient();
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching tables:', error);
    return [];
  }
}

export default getTables;
