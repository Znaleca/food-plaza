'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { Query } from 'appwrite';

const getMyClaimedVouchers = async () => {
  try {
    const { databases } = await createAdminClient();
    const { user } = await checkAuth();

    if (!user) throw new Error('You must be logged in to view claimed vouchers.');

    // Fetch ALL vouchers that the user has claimed
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
      [Query.contains('claimed_users', [user.id])]
    );

    return { vouchers: response.documents, userId: user.id };
  } catch (error) {
    console.error('Error fetching claimed vouchers:', error);
    return { vouchers: [], userId: null };
  }
};

export default getMyClaimedVouchers;
