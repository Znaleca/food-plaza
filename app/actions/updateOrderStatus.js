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

const updateOrderStatus = async (orderId, itemIndex, newStatus) => {
  try {
    const { databases } = await createAdminClient();

    // Fetch the current order document
    const order = await databases.getDocument(databaseId, collectionId, orderId);

    // Clone items and update the status of the targeted item
    const items = [...order.items];
    const parsedItems = items.map((itemStr, idx) => {
      try {
        const item = JSON.parse(itemStr);
        if (idx === itemIndex) {
          item.status = newStatus;
        }
        return JSON.stringify(item);
      } catch (err) {
        return itemStr; // Leave unparsed if error
      }
    });

    // Preserve the existing rating (must be valid for Appwrite schema)
    const rating =
      Array.isArray(order.rating) && order.rating.every(r => r >= 1 && r <= 5)
        ? order.rating
        : [];

    // Perform the update
    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      orderId,
      {
        items: parsedItems,
        rating, // Keep existing valid rating
      }
    );

    return response;
  } catch (error) {
    console.error("Failed to update item status:", error);
    throw error;
  }
};

export default updateOrderStatus;
