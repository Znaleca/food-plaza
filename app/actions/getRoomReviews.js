'use server';

import { createAdminClient } from '@/config/appwrite';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite';

const getRoomReviews = async (roomId, page = 1, limit = 10) => {
  try {
    const { databases } = await createAdminClient();

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_REVIEWS, // Your review collection
      [
        Query.equal('roomId', roomId), // Filter by roomId
        Query.limit(limit), // Limit number of reviews
        Query.offset((page - 1) * limit), // Pagination offset
        Query.orderDesc('created_at'), // Sorting by date
      ]
    );

    const reviews = response.documents;

    return {
      reviews: reviews,
      totalReviews: reviews.length,
      currentPage: page,
      totalPages: Math.ceil(reviews.length / limit),
    };
  } catch (error) {
    console.error('Failed to fetch room reviews:', error);
    redirect('/error'); // Redirect in case of failure
  }
};

export default getRoomReviews;
