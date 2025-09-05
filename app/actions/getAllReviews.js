'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

const getAllReviews = async (page = 1, limit = 10) => {
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

    const allOrders = response.documents;

    // 🔑 Instead of filtering them out, just return all and let the frontend decide
    return {
      orders: allOrders,
      totalOrders: allOrders.length,
      currentPage: page,
      totalPages: Math.ceil(allOrders.length / limit),
    };
  } catch (error) {
    console.error('Failed to fetch all reviews:', error);

    return {
      orders: [],
      totalOrders: 0,
      currentPage: page,
      totalPages: 0,
    };
  }
};

export default getAllReviews;
