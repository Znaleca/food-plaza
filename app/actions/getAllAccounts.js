'use server';
import { createAdminClient } from '@/config/appwrite';

export const getAllAccounts = async () => {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID, // Replace with your database ID
      process.env.NEXT_PUBLIC_USERS_COLLECTION_ID // Replace with your collection ID
    );
    return response.documents || [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
};
