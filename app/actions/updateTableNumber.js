'use server';

import { createAdminClient } from '@/config/appwrite';

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS;

if (!databaseId || !collectionId) {
  console.error("Missing required Appwrite environment variables for database or collection:", {
    databaseId,
    collectionId,
  });
  throw new Error("Missing required Appwrite environment variables.");
}

const updateTableNumber = async (roomId, newTableNumber) => {
  try {
    const { databases } = await createAdminClient();
    console.log("Updating tableNumber for document", { roomId, newTableNumber });

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      roomId,
      {
        tableNumber: Array.isArray(newTableNumber)
          ? newTableNumber.map((num) => parseInt(num, 10))
          : newTableNumber !== null
          ? [parseInt(newTableNumber, 10)]
          : null,
      }
    );

    return response;
  } catch (error) {
    console.error("Failed to update tableNumber:", error);
    throw error;
  }
};

export default updateTableNumber;
