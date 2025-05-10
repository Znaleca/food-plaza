'use server';

import { createAdminClient } from "@/config/appwrite";

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NEWS;

if (!databaseId || !collectionId) {
  console.error("Missing required Appwrite environment variables for database or collection:", {
    databaseId,
    collectionId,
  });
  throw new Error("Missing required Appwrite environment variables.");
}

const updateNews = async (newsContent) => {
  try {
    const { databases } = await createAdminClient();
    console.log("Updating news document", { documentId: 'news', databaseId, collectionId });

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      'news',
      { news: newsContent }
    );

    return response;
  } catch (error) {
    console.error("Failed to update news:", error);
    throw new Error("Unable to update news.");
  }
};

export default updateNews;
