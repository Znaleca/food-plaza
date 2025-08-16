'use server';

import { createAdminClient } from '@/config/appwrite';
import { ID } from 'node-appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

async function updateStallNumber(_, formData) {
  try {
    const { databases } = await createAdminClient();

    const id = formData.get('id');
    const stallNumber = parseInt(formData.get('stallNumber'), 10);
    if (isNaN(stallNumber)) {
      throw new Error('Invalid stall number. It must be an integer.');
    }

    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      stallNumber,
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error('Update Error:', error);
    return { success: false, error: error.message || 'Failed to update stall number.' };
  }
}

export default updateStallNumber;
