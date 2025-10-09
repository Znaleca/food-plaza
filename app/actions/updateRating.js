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

// Refactored to accept an object for dynamic updates
const updateRating = async (orderId, updateData) => {
  try {
    const { databases } = await createAdminClient();
    
    // Initialize payload for Appwrite update
    const payload = {};

    // 1. Handle Item-level updates
    if (updateData.item) {
        payload.rating = updateData.item.ratings;
        payload.comment = updateData.item.comments;
        payload.rated = updateData.item.ratedStatus;
    }

    // 2. Handle Stall-level updates
    // The client component ensures updateData.stall.reviews is an array of JSON strings.
    if (updateData.stall) {
        payload.stallReviews = updateData.stall.reviews; 
    }

    if (Object.keys(payload).length === 0) {
        console.warn("No update data provided for order:", orderId);
        return { success: true, message: "No changes to commit." };
    }

    console.log("Updating document with", { orderId, payload });

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      orderId,
      payload
    );

    return response;
  } catch (error) {
    console.error("Failed to update rating information:", error);
    throw error;
  }
};

export default updateRating;