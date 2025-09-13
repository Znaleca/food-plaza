'use server';

import { createAdminClient } from "@/config/appwrite";
import { ID, Query } from "node-appwrite";

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

    // 1. Get all existing news documents
    const existingDocs = await databases.listDocuments(
      databaseId,
      collectionId,
      [Query.limit(100)] // adjust if you expect more than 100
    );

    // 2. Delete each old document
    for (const doc of existingDocs.documents) {
      await databases.deleteDocument(databaseId, collectionId, doc.$id);
    }

    // 3. Create a fresh news document
    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      { news: newsContent }
    );

    return response;
  } catch (error) {
    console.error("Failed to replace news:", error);
    throw new Error("Unable to update news.");
  }
};

export default updateNews;
