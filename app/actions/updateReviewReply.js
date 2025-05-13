'use server';

import { createAdminClient } from '@/config/appwrite';
import { redirect } from 'next/navigation';

const updateReviewReply = async (reviewId, newReply) => {
  try {
    const { databases } = await createAdminClient();

    // Fetch the existing review document first
    const existingReview = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      reviewId
    );

    // Get the existing replies, or initialize as an empty array
    const existingReplies = existingReview.reply || [];

    // Append the new reply to the existing replies array
    const updatedReplies = [...existingReplies, newReply];

    // Update the review document with the new replies array
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      reviewId, // the review document ID
      { reply: updatedReplies } // the updated replies array
    );
  } catch (error) {
    console.error('Failed to update review reply:', error);
    redirect('/error');
  }
};

export default updateReviewReply;
