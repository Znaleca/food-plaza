// app/actions/claimVoucher.js

'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { revalidatePath } from 'next/cache';

const claimVoucher = async (voucherId) => {
  try {
    const { databases } = await createAdminClient();
    const { user } = await checkAuth();

    if (!user) throw new Error('You must be logged in to claim a voucher.');
    if (!voucherId) throw new Error('Invalid voucher ID.');

    const voucher = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
      voucherId
    );

    const claimedUsers = voucher.claimed_users || [];

    // Check if the voucher quantity has been reached.
    // This is a crucial check to prevent over-claiming.
    if (claimedUsers.length >= voucher.quantity) {
      throw new Error('This voucher is no longer available.');
    }

    if (claimedUsers.includes(user.id)) {
      throw new Error('You have already claimed this voucher.');
    }

    claimedUsers.push(user.id);

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
      voucherId,
      {
        claimed_users: claimedUsers,
      }
    );

    revalidatePath('/foodstall/promos');

    return { success: true };
  } catch (error) {
    console.error('Error claiming voucher:', error);
    return { success: false, error: error.message };
  }
};

export default claimVoucher;