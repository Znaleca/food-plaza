'use server';

import { createAdminClient } from '@/config/appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

const updateAvailability = async ({ id, menuAvailability }) => {
  try {
    const { databases } = await createAdminClient();

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid or missing stall ID.');
    }

    if (!Array.isArray(menuAvailability) || menuAvailability.length === 0) {
      throw new Error('Availability list must contain at least one value.');
    }

    // Ensure all values are boolean true/false
    const parsedAvailability = menuAvailability.map((val) => val === true);

    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      menuAvailability: parsedAvailability,
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('[Appwrite] Failed to update menu availability:', error);
    return {
      success: false,
      error: error?.message || 'Unexpected error occurred while updating availability.',
    };
  }
};

export default updateAvailability;
