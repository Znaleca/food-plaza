// app/actions/updateMenuRecipes.js

'use server';

import { createAdminClient } from '@/config/appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

/**
 * Updates the recipes (Bill of Materials) for all menu items in a stall.
 *
 * @param {object} params
 * @param {string} params.id - The document ID of the stall/space to update.
 * @param {string[]} params.menuRecipes - An array of recipe strings.
 * Format of each string: "ingredientName^requiredAmount^unit|ingredientName^requiredAmount^unit|..."
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
const updateMenuRecipes = async ({ id, menuRecipes }) => {
  try {
    const { databases } = await createAdminClient();

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid or missing stall ID.');
    }

    if (!Array.isArray(menuRecipes)) {
      throw new Error('Invalid menu recipes data.');
    }
    
    // We expect the length of menuRecipes to match the menu item count
    // The validation for the string format (ingredient^amount^unit) should be on the client side

    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      menuRecipes: menuRecipes, // Save the array of recipe strings
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('[Appwrite] Failed to update menu recipes:', error);
    return {
      success: false,
      error: error?.message || 'Unexpected error occurred while updating menu recipes.',
    };
  }
};

export default updateMenuRecipes;