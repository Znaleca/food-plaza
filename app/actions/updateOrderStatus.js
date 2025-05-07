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

/**
 * Update the status of a specific item in the order.
 * @param {string} orderId - ID of the order document
 * @param {number} itemIndex - Index of the item in the `items` array
 * @param {string} newStatus - New status to set (e.g., 'preparing', 'ready')
 */
const updateOrderStatus = async (orderId, itemIndex, newStatus) => {
  try {
    const { databases } = await createAdminClient();

    // Fetch the current order document
    const order = await databases.getDocument(databaseId, collectionId, orderId);
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

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      orderId,
      {
        items: parsedItems,
      }
    );

    return response;
  } catch (error) {
    console.error("Failed to update item status:", error);
    throw error;
  }
};

export default updateOrderStatus;
