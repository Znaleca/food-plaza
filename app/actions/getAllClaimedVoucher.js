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

    return response.documents; // Always return array or empty array
  } catch (error) {
    console.error('Error fetching claimed vouchers:', error);
    return []; // Return empty array on failure for consistency
  }
};

export default getAllClaimedVouchers;
