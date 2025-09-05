'use server';

import { Query } from 'node-appwrite';
import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SPECIAL_DISCOUNT;

export default async function getSpecialDiscount() {
  try {
    // ✅ Check authentication
    const { isAuthenticated, user } = await checkAuth();

    if (!isAuthenticated || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // ✅ Get admin client
    const { databases } = await createAdminClient();

    // ✅ Fetch only documents created by this user
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('user_id', user.id)] // assumes you store user_id when creating
    );

    return { success: true, documents: result.documents };
  } catch (err) {
    console.error('Error fetching special discount:', err);
    return { success: false, error: err.message };
  }
}
