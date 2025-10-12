'use server';

import { createAdminClient } from '@/config/appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

const updateInventory = async (_, formData) => {
  try {
    const { databases } = await createAdminClient();

    const id = formData.get('id');
    const stocks = formData.getAll('stocks[]');

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid or missing stall ID.');
    }

    if (!Array.isArray(stocks) || stocks.length === 0) {
      // Allow saving an empty array if the user clears the inventory
      // However, if the user intends to save non-empty, we validate below.
      if (stocks.length === 0) {
        // Clear all stocks if the array is intentionally empty
        const cleared = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
          stocks: [],
        });
        return {
          success: true,
          data: cleared,
        };
      }
      throw new Error('Inventory must contain at least one item.');
    }

    // Validation Check:
    // We expect exactly 5 parts separated by '|'.
    // Part 2 (index 1, the ingredient field) is allowed to contain the '::' separator.
    const malformed = stocks.some((s) => {
      const parts = s.split('|');
      
      // 1. Must have exactly 5 parts (Group|Ingredient::Menu|Quantity|BatchDate|ExpiryDate)
      if (parts.length !== 5) {
        return true;
      }

      // 2. Check if the required fields (Group, Quantity, BatchDate, ExpiryDate) are non-empty.
      // We skip index 1 (the complex ingredient string) for a simpler non-empty check
      // and rely on the frontend to validate its structure.
      const [group, ingredientData, quantity, batchDate, expiryDate] = parts;
      
      // The ingredient data (index 1) should be validated in the front-end to ensure
      // Ingredient Name is present. Here we just ensure the Group and Quantity are sensible.
      if (!group.trim() || !quantity.trim() || !ingredientData.trim()) {
         return true;
      }
      
      // We assume batchDate and expiryDate are valid strings, including "no expiration".

      return false; // passes validation
    });

    if (malformed) {
      console.error('Malformed stock entries detected:', stocks.filter(s => s.split('|').length !== 5 || !s.split('|')[0].trim() || !s.split('|')[2].trim()));
      throw new Error('Some inventory entries are incorrectly formatted (must have 5 components and essential fields must not be empty).');
    }

    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      stocks,
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('[Appwrite] Failed to update inventory:', error);
    return {
      success: false,
      error: error?.message || 'Unexpected error occurred while updating inventory.',
    };
  }
};

export default updateInventory;