'use server';
import { createAdminClient } from '@/config/appwrite';

export const updateNews = async (newsContent) => {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NEWS,
      'news', // Document ID
      { news: newsContent } // Update the `news` attribute
    );
    return response;
  } catch (error) {
    console.error("Failed to update news:", error);
    throw new Error("Unable to update news.");
  }
};
