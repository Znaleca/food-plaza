'use server';

import { createAdminClient } from '@/config/appwrite'; // Ensure this path is correct

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

/**
 * Updates the menu quantity (stock level) for a specific food stall.
 *
 * @param {object} params
 * @param {string} params.id - The document ID of the stall/space to update.
 * @param {number[]} params.menuQuantity - An array of integers representing the new stock level for each menu item.
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
const updateMenuQuantity = async ({ id, menuQuantity }) => {
  try {
    const { databases } = await createAdminClient();

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid or missing stall ID.');
    }

    if (!Array.isArray(menuQuantity) || menuQuantity.length === 0) {
      // Allow saving an empty array if all menu items were deleted
    }

    // Ensure all values are parsed as integers, defaulting to 0 for non-numeric values
    const parsedQuantity = menuQuantity.map((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) ? 0 : num;
    });

    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      menuQuantity: parsedQuantity,
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('[Appwrite] Failed to update menu quantity:', error);
    return {
      success: false,
      error: error?.message || 'Unexpected error occurred while updating menu quantity.',
    };
  }
};

export default updateMenuQuantity;