'use server';

import { createAdminClient } from '@/config/appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

/**
 * Updates the operating status of a food stall (room) in the database.
 * * @param {object} params - The parameters for the update.
 * @param {string} params.id - The ID of the food stall document.
 * @param {boolean} params.status - The new operating status (true for Open, false for Closed).
 * @returns {Promise<{success: boolean, data?: object, error?: string}>} The result of the operation.
 */
const updateOperatingStatus = async ({ id, status }) => {
  try {
    const { databases } = await createAdminClient();

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid or missing stall ID.');
    }

    if (typeof status !== 'boolean') {
        throw new Error('Operating status must be a boolean (true/false).');
    }

    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      // The name of the attribute in your Appwrite collection should match 'operatingStatus'
      operatingStatus: status,
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('[Appwrite] Failed to update operating status:', error);
    return {
      success: false,
      error: error?.message || 'Unexpected error occurred while updating operating status.',
    };
  }
};

export default updateOperatingStatus;