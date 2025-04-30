'use server';

import { createAdminClient } from '@/config/appwrite';
import { redirect } from 'next/navigation';
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

    // Filter to only orders with at least one rated item
    const reviewedOrders = allOrders.filter(order => {
      return Array.isArray(order.rated) && order.rated.some((r) => r === true);
    });

    return {
      orders: reviewedOrders,
      totalOrders: reviewedOrders.length,
      currentPage: page,
      totalPages: Math.ceil(reviewedOrders.length / limit),
    };
  } catch (error) {
    console.error('Failed to fetch all reviews:', error);
    redirect('/error');
  }
};

export default getAllReviews;
