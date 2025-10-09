'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

// Helper function to safely parse a JSON string
const safeParseReview = (reviewStr) => {
    try {
        // Appwrite often stores arrays of complex data as arrays of JSON strings
        return JSON.parse(reviewStr);
    } catch (e) {
        console.warn("Failed to parse stall review string:", reviewStr, e);
        return null;
    }
}

/**
 * Fetches all individual stall reviews from all orders that contain them.
 */
const getAllStallReviews = async () => {
  try {
    const { databases } = await createAdminClient();

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      // Using the collection where 'stallReviews' array exists
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS, 
      [
        // 1. Filter documents to only include those that have the 'stallReviews' attribute set
        // Appwrite's 'isNotNull' query is perfect for checking if the array exists/is not empty.
        Query.isNotNull('stallReviews'),
        // 🚨 Fetch a reasonable limit for reviews. Since one order can have multiple stall reviews, 
        // 100 documents might yield more than 100 reviews.
        Query.limit(100), 
        Query.orderDesc('$createdAt'), // Use $createdAt for overall order time
      ]
    );

    const extractedReviews = [];

    // 2. Iterate through each order document that has stall reviews
    response.documents.forEach(doc => {
        if (!Array.isArray(doc.stallReviews)) return;
        
        // 3. Iterate through the array of stall review JSON strings
        doc.stallReviews.forEach(reviewString => {
            const reviewObject = safeParseReview(reviewString);
            
            if (reviewObject && reviewObject.rating) {
                // Extract and flatten the review data
                extractedReviews.push({
                    // Use $id as a unique key for the whole review document
                    orderId: doc.$id, 
                    // Extract fields from the parsed JSON object
                    roomId: reviewObject.roomId,
                    roomName: reviewObject.roomName || 'Unknown Stall',
                    rating: reviewObject.rating,
                    comment: reviewObject.comment,
                    rated_at: reviewObject.rated_at,
                    // ADDED: Include the user_id from the parsed review object
                    user_id: reviewObject.user_id, 
                    // Includes the user's name from the order document
                    user: doc.name || 'Anonymous', 
                });
            }
        });
    });

    return {
      reviews: extractedReviews,
    };
  } catch (error) {
    // Log Appwrite or parsing errors
    console.error('Failed to fetch and process stall reviews:', error);

    return {
      reviews: [],
    };
  }
};

export default getAllStallReviews;