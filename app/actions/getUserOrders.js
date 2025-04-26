'use server';

import { createAdminClient } from '@/config/appwrite';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite';
import checkAuth from './checkAuth';

const getUserOrders = async (page = 1, limit = 10) => {
  try {
    const { databases } = await createAdminClient();
    const { user } = await checkAuth();

    if (!user) {
      console.error("User not authenticated");
      redirect('/login'); // Better UX redirect for unauthenticated users
    }

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      [
        Query.equal('user_id', user.id),
        Query.limit(limit),
        Query.offset((page - 1) * limit),
        Query.orderDesc('created_at'), // Show recent orders first
      ]
    );

    return {
      orders: response.documents,
      totalOrders: response.total,
      currentPage: page,
      totalPages: Math.ceil(response.total / limit),
    };
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    redirect('/error');
  }
};

export default getUserOrders;
