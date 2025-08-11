'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { Query } from 'appwrite';

const getAllClaimedVouchers = async () => {
  try {
    const { databases } = await createAdminClient();
    const { user } = await checkAuth();

    if (!user) throw new Error('You must be logged in to view claimed vouchers.');

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
      [Query.contains('claimed_users', [user.id])]
    );

    // Filter out vouchers already redeemed by this user
    const availableVouchers = response.documents.filter(
      (voucher) => !Array.isArray(voucher.redeemed) || !voucher.redeemed.includes(user.id)
    );

    return availableVouchers; // Only return unredeemed vouchers
  } catch (error) {
    console.error('Error fetching claimed vouchers:', error);
    return [];
  }
};

export default getAllClaimedVouchers;
