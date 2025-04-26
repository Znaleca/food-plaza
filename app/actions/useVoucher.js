'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';

const useVoucher = async (voucherId, markAsUsed = true) => {
  try {
    const { databases } = await createAdminClient();
    const { user } = await checkAuth();

    if (!user) {
      throw new Error('Unauthorized: Please log in.');
    }

    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS;

    // Fetch voucher first
    const voucher = await databases.getDocument(databaseId, collectionId, voucherId);

    if (voucher.user_id !== user.id) {
      throw new Error('You do not own this voucher.');
    }

    const updatedVoucher = await databases.updateDocument(
      databaseId,
      collectionId,
      voucherId,
      {
        used_voucher: markAsUsed
      }
    );

    return { success: true, document: updatedVoucher };
  } catch (error) {
    console.error('Error using voucher:', error);
    return { success: false, error: error.message };
  }
};

export default useVoucher;
