'use server';

import { createAdminClient } from "@/config/appwrite";

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS;

if (!databaseId || !collectionId) {
  console.error("Missing required Appwrite environment variables for database or collection:", {
    databaseId,
    collectionId,
  });
  throw new Error("Missing required Appwrite environment variables.");
}

const updateRating = async (roomId, updatedRatings, updatedComments, updatedRatedStatus) => {
  try {
    const { databases } = await createAdminClient();
    console.log("Updating document with", { roomId, updatedRatings, updatedComments, updatedRatedStatus });

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      roomId,
      {
        rating: updatedRatings,
        comment: updatedComments,
        rated: updatedRatedStatus,
      }
    );

    return response;
  } catch (error) {
    console.error("Failed to update rating information:", error);
    throw error;
  }
};

export default updateRating;
