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

    const voucher = await databases.getDocument(databaseId, collectionId, voucherId);

    const claimedUsers = voucher.claimed_users || [];
    const usedVoucherArray = voucher.used_voucher || [];

    const userIndex = claimedUsers.indexOf(user.id);
    if (userIndex === -1) {
      throw new Error('You do not own this voucher.');
    }

    // Clone the array and update the specific index
    const updatedUsedVoucherArray = [...usedVoucherArray];
    updatedUsedVoucherArray[userIndex] = markAsUsed;

    const updatedVoucher = await databases.updateDocument(
      databaseId,
      collectionId,
      voucherId,
      {
        used_voucher: updatedUsedVoucherArray
      }
    );

    return { success: true, document: updatedVoucher };
  } catch (error) {
    console.error('Error using voucher:', error);
    return { success: false, error: error.message };
  }
};

export default useVoucher;
