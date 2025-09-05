'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

const getAllOrders = async (page = 1, limit = 10) => {
  try {
    const { databases } = await createAdminClient();

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      [
        Query.limit(limit),
        Query.offset((page - 1) * limit),
        Query.orderDesc('created_at'),
      ]
    );

    return {
      orders: response.documents,
      totalOrders: response.total,
      currentPage: page,
      totalPages: Math.ceil(response.total / limit),
    };
  } catch (error) {
    console.error('Failed to fetch all orders:', error);

    // ✅ Don’t redirect, just return empty
    return {
      orders: [],
      totalOrders: 0,
      currentPage: page,
      totalPages: 0,
    };
  }
};

export default getAllOrders;
