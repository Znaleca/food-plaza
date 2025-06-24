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
      throw new Error('Inventory must contain at least one item.');
    }

    const malformed = stocks.some((s) => {
      const parts = s.split('|');
      return parts.length !== 5 || parts.some((p) => typeof p !== 'string' || !p.trim());
    });

    if (malformed) {
      throw new Error('Some inventory entries are incorrectly formatted.');
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
