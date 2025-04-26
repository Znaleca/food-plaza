'use server';

import { createAdminClient } from "@/config/appwrite";

// Get database and collection IDs from env variables
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

if (!databaseId || !collectionId) {
  console.error("Missing required Appwrite environment variables for database or collection:", {
    databaseId,
    collectionId,
  });
  throw new Error("Missing required Appwrite environment variables.");
}

const updateQuantities = async (roomId, updatedQuantities) => {
  try {
    const { databases } = await createAdminClient();
    console.log("Updating document with", { roomId, databaseId, collectionId, updatedQuantities });

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      roomId,
      {
        menuQuantity: updatedQuantities,
      }
    );

    return response;
  } catch (error) {
    console.error("Failed to update menuQuantity:", error);
    throw error;
  }
};

export default updateQuantities;
